const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "..", ".env") });

const ROOT_DIR = path.join(__dirname, "..");

module.exports = {
  PORT: process.env.PORT || 3000,
  DATABASE_NAME: process.env.MONGODB_DB_NAME || "baikiemtracuoiky",
  MONGODB_URI: process.env.MONGODB_URI || "",
  DATA_DIR: path.join(ROOT_DIR, "data"),
  TEACHERS_FILE: path.join(ROOT_DIR, "data", "teachers.json"),
  POSITIONS_FILE: path.join(ROOT_DIR, "data", "teacher-positions.json"),
  TEACHERS_COLLECTION: "teachers",
  POSITIONS_COLLECTION: "teacherPositions",
};
