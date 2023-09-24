const Sequelize = require("sequelize");

const dbName = process.env.DB_NAME;
const dbUsername = process.env.DB_USERNAME;
const dbPass = process.env.DB_PASSWORD;
const dbHost = process.env.DB_HOST;

const sequelize = new Sequelize(dbName, dbUsername, dbPass, {
  host: dbHost,
  dialect: "mysql",
});

module.exports = sequelize;
