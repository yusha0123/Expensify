const jwt = require("jsonwebtoken");
const User = require("../models/user");
const asyncHandler = require("express-async-handler");

const requireAuth = asyncHandler(async (req, res, next) => {
  const { authorization } = req.headers;
  if (!authorization) {
    res.status(401);
    throw new Error("Authorization token Required!");
  }
  const token = authorization.split(" ")[1];
  try {
    const { _id } = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findByPk(_id, {
      attributes: { exclude: ["password"] }, // Exclude the 'password' field
    });
    if (!user) {
      //if provided id is invalid
      res.status(401);
      throw new Error("UnAuthorized Access!");
    }
    req.user = user;
    next();
  } catch (error) {
    //if token is invalid
    res.status(401);
    throw new Error("UnAuthorized Access!");
  }
});

module.exports = requireAuth;
