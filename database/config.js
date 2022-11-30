require('dotenv').config(); 
const {DB_USER, DB_PASSWORD, DB_HOST, DB_NAME, DB_PORT} = process.env;
const { Sequelize } = require('sequelize');

const sequelize = process.env.NODE_ENV === "production"
? new Sequelize({
    database: DB_NAME,
    dialect: "postgres",
    host: DB_HOST,
    port: DB_PORT,
    username: DB_USER,
    password: DB_PASSWORD,
    pool: {
      max: 3,
      min: 1,
      idle: 10000,
    },
    dialectOptions: {
      ssl: {
        require: true,
    
        rejectUnauthorized: false,
      },
      keepAlive: true,
    },
    ssl: true,
  })
: new Sequelize(`postgres://${DB_USER}:${DB_PASSWORD}@${DB_HOST}/${DB_NAME}`, {
  logging: false, // set to console.log to see the raw SQL queries
  native: false, // lets Sequelize know we can use pg-native for ~30% more speed
});

module.exports = sequelize;
