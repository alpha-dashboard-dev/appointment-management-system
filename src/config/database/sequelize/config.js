import * as dotenv from "dotenv"

dotenv.config();

export default {
  "development": {
    "username": process.env.DATABASE_USERNAME,
    "password": String(process.env.DATABASE_PASSWORD),
    "database": process.env.DATABASE_NAME,
    "host": process.env.DATABASE_HOST,
    "dialect": "postgres",
  }
}