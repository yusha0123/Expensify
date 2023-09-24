const { DataTypes } = require("sequelize");
const sequelize = require("../utils/database");

const Download = sequelize.define("download", {
  _id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  url: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});

module.exports = Download;
