// Importa la librería mysql2 para poder conectarse a una base de datos MySQL
import mysql from "mysql2";

// Importa dotenv para leer las variables de entorno desde el archivo .env
import dotenv from "dotenv";

// Carga las variables definidas en el archivo .env al entorno de Node.js
dotenv.config();

// Crea la conexión a la base de datos usando las variables del archivo .env
const db = mysql.createConnection({
  host: process.env.DB_HOST,       
  user: process.env.DB_USER,       
  password: process.env.DB_PASSWORD, 
  database: process.env.DB_NAME,   
  port: process.env.DB_PORT        
});

// Intenta establecer la conexión con la base de datos
db.connect((err) => {
  if (err) {
    // Si ocurre un error, se muestra un mensaje indicando que la conexión falló
    console.log("Error de conexión");
  } else {
    // Si no hay error, la conexión a la base de datos fue exitosa
    console.log("Conexión a la base de datos exitosa");
  }
});


export default db;

