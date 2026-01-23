import mysql from "mysql2";
import dotenv from "dotenv";

dotenv.config();

const db = mysql.createConnection({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "supermercado",
  port: process.env.DB_PORT || 3306
});

db.connect((err) => {
  if (err) {
    console.error("Error de conexión a MySQL:", err);
    process.exit(1);
  } else {
    console.log("MySQL conectado exitosamente");
  }
});

export default db;
