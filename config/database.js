const dotenv = require("dotenv");
const Sequelize = require("sequelize");
dotenv.config();

var db_name = process.env.DB_NAME;
var db_user = process.env.DB_UNAME;
var db_password = process.env.DB_PASSWORD;
var db_host = process.env.DB_HOST;

// create connection
const sequelizeConf = new Sequelize(db_name, db_user, db_password, {
  host: db_host,
  dialect: "mysql",
  define: {
    charset: "utf8mb4",
  },
  timezone: "+07:00",
  retry: { max: 5 },
});

module.exports = sequelizeConf;
