const User = require("../models/user");
const asyncHandler = require("express-async-handler");
const { encryptPassword, isCorrectPass } = require("../utils/hashing");
const validator = require("validator");
const createToken = require("../utils/tokenGenerator");
const nodemailer = require("nodemailer");
const { v4: uuidv4 } = require("uuid");
const ForgotPasswordRequest = require("../models/resetPassword");
const sequelize = require("../utils/database");
let emailTemplate = require("../views/emailTemplate");
const path = require("path");

const createUser = asyncHandler(async (req, res, next) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    res.status(400);
    throw new Error("All fields are Mandatory!");
  }
  //check if user already exists
  const existingUser = await User.findOne({
    where: {
      email: email,
    },
  });
  if (existingUser) {
    res.status(400);
    throw new Error("User Already Exists!");
  }
  //check if email or password is correct
  if (!validator.isEmail(email)) {
    res.status(400);
    throw new Error("Please use a Valid Email!");
  }
  if (!validator.isStrongPassword(password)) {
    res.status(400);
    throw new Error("Password is not Strong Enough!");
  }
  //Signup the user
  const hashedPassword = await encryptPassword(password);
  const result = await User.create({
    name: name,
    email: email,
    password: hashedPassword,
  });
  const token = createToken(result._id);
  res.status(201).json({
    success: true,
    message: "User Registered Successfully!",
    token: token,
    email: email,
    isPremium: result.isPremium,
  });
});

const login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) {
    res.status(400);
    throw new Error("All fields are Mandatory!");
  }
  //check if user exists
  const result = await User.findOne({
    where: {
      email: email,
    },
  });
  if (!result) {
    res.status(404);
    throw new Error("User doesn't Exists!");
  }
  //check if provided password is correct
  const isValidUser = await isCorrectPass(result.password, password);
  if (!isValidUser) {
    res.status(401);
    throw new Error("Invalid Credentials!");
  }
  //login the user
  const token = createToken(result._id);
  res.status(200).json({
    success: true,
    message: "User Logged in Successfully!",
    token: token,
    email: email,
    isPremium: result.isPremium,
  });
});

const resetPassword = asyncHandler(async (req, res, next) => {
  const { email } = req.body;
  if (!email) {
    res.status(400);
    throw new Error("Please provide an Email!");
  }
  //check if user exists
  const user = await User.findOne({
    where: {
      email: email,
    },
  });
  if (!user) {
    res.status(404);
    throw new Error("User not Found!");
  }
  const uuid = uuidv4();
  const t = await sequelize.transaction(); //starting a transaction
  const serverAddress = process.env.SERVER_ADDRESS;
  emailTemplate = emailTemplate.replace("{UUID_PLACEHOLDER}", uuid); //adding dynamic token
  emailTemplate = emailTemplate.replace(
    "{SERVER_ADDRESS_PLACEHOLDER}",
    serverAddress
  ); //adding dynamic server address

  try {
    await ForgotPasswordRequest.create(
      {
        token: uuid,
        userId: user._id,
      },
      {
        transaction: t,
      }
    );
    const transporter = nodemailer.createTransport({
      host: "smtp-relay.sendinblue.com",
      port: 587,
      auth: {
        user: process.env.email,
        pass: process.env.pass,
      },
    });
    await transporter.sendMail({
      from: process.env.email,
      to: req.body.email,
      subject: "Reset Password for Expensify Account",
      html: emailTemplate,
    });
    await t.commit();
    res.status(200).json({ success: true, message: "Email sent!" });
  } catch (error) {
    await t.rollback();
    throw new Error("Internal Server Error!");
  }
});

const validateToken = asyncHandler(async (req, res, next) => {
  const token = req.query.token;
  if (!token) {
    res.status(400);
    throw new Error("Invalid Link!");
  }

  const result = await ForgotPasswordRequest.findOne({
    where: {
      token: token,
    },
  });
  if (!result) {
    return res
      .status(404)
      .send("Please request a new Link to reset your Password!");
  }
  res.sendFile(path.join(__dirname, "../", "views", "resetPass.html"));
});

const changePassword = asyncHandler(async (req, res, next) => {
  const token = req.params.token;
  const { password } = req.body;
  if (!password) {
    res.status(400);
    throw new Error("Please enter new Password!");
  }
  //get token and userId from database
  const result = await ForgotPasswordRequest.findOne({
    where: {
      token: token,
    },
  });
  if (!result) {
    res.status(400);
    throw new Error("Invalid Session!");
  }

  if (!validator.isStrongPassword(password)) {
    res.status(400);
    throw new Error("Password is not Strong Enough!");
  }

  const expiresInDate = new Date(result.expiresIn);
  const currentDate = new Date();
  if (expiresInDate < currentDate) {
    //check if session exists
    res.status(400);
    throw new Error("Session Expired!");
  }

  //hashpassword before saving to database
  const hashedPassword = await encryptPassword(password);
  const t = await sequelize.transaction(); //starting a transaction
  try {
    await User.update(
      {
        password: hashedPassword,
      },
      {
        where: {
          _id: result.userId,
        },
        transaction: t,
      }
    );
    //delete the token from database just to make sure that each link works only one
    await ForgotPasswordRequest.destroy({
      where: {
        token: token,
      },
      transaction: t,
    });
    await t.commit();
    res.status(200).json({
      success: true,
      message: "Password updated Successfully!",
    });
  } catch (error) {
    await t.rollback();
    throw new Error("Internal Server Error!");
  }
});

module.exports = {
  createUser,
  login,
  resetPassword,
  validateToken,
  changePassword,
};
