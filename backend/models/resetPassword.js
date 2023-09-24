const { DataTypes } = require("sequelize");
const sequelize = require("../utils/database");

const ForgotPasswordRequest = sequelize.define("token", {
  token: {
    type: DataTypes.STRING,
    allowNull: false,
    primaryKey: true,
  },
  expiresIn: {
    type: DataTypes.DATE,
    defaultValue: () => new Date(Date.now() + 10 * 60 * 1000),
  },
});

module.exports = ForgotPasswordRequest;
