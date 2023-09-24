const { DataTypes } = require("sequelize");
const sequalize = require("../utils/database");

const User = sequalize.define("user", {
  _id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  isPremium: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  totalExpenses: {
    type: DataTypes.DOUBLE,
    defaultValue: 0,
  },
});

module.exports = User;
