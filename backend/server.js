require("dotenv").config();
const express = require("express");
const path = require("path");
const errorhandler = require("./middleware/errorHandler");
const authRoutes = require("./routes/auth");
const expenseRoutes = require("./routes/expense");
const premiumRoutes = require("./routes/premium");
const User = require("./models/user");
const Expense = require("./models/expense");
const ForgotPasswordRequest = require("./models/resetPassword");
const Download = require("./models/download");
const sequelize = require("./utils/database");

const app = express();
const port = process.env.PORT || 3000;
app.use(express.json());

//routes
app.use("/api/auth", authRoutes);
app.use("/api/expense", expenseRoutes);
app.use("/api/premium", premiumRoutes);
app.use(errorhandler); //error Handler

//frontend routes handler
app.use(express.static(path.join(__dirname, "../frontend", "dist")));
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/dist", "index.html"));
});

//Creating Relations in Db
Expense.belongsTo(User, { constraints: true, onDelete: "CASCADE" });
User.hasMany(Expense);
User.hasMany(ForgotPasswordRequest, {
  foreignKey: "userId",
  onDelete: "CASCADE",
});
ForgotPasswordRequest.belongsTo(User, {
  foreignKey: "userId",
});
Download.belongsTo(User, { foreignKey: "userId", onDelete: "CASCADE" });
User.hasMany(Download, { foreignKey: "userId" });

sequelize
  .sync()
  .then(() => {
    app.listen(port, () => console.log(`Server running on PORT : ${port}`));
  })
  .catch((err) => {
    console.log(err);
  });
