
import express from "express";

import db from "./data.js";

// Crea la aplicación Express
const app = express();


app.use(express.json());


// Ruta GET que devuelve todos los registros de la tabla clientes
app.get("/clientes", (req, res) => {
  // Ejecuta una consulta SQL para obtener todos los clientes
  db.query("SELECT * FROM clientes", (err, result) => {
    // Devuelve los datos obtenidos en formato JSON
    res.json(result);
  });
});


// Ruta POST que inserta un nuevo cliente en la base de datos
app.post("/clientes", (req, res) => {
  // Extrae los datos enviados en el cuerpo de la petición
  const { nombre, correo } = req.body;

  // Ejecuta la consulta SQL para insertar el nuevo cliente
  db.query(
    "INSERT INTO clientes (nombre, correo) VALUES (?, ?)",
    [nombre, correo],
    () => res.send("Cliente creado")
  );
});


// Ruta PUT que actualiza el nombre de un cliente según su ID
app.put("/clientes/:id", (req, res) => {
  // Obtiene el nuevo nombre desde el cuerpo de la petición
  const { nombre } = req.body;

  // Ejecuta la consulta SQL para actualizar el cliente
  db.query(
    "UPDATE clientes SET nombre=? WHERE id=?",
    [nombre, req.params.id],
    () => res.send("Cliente actualizado")
  );
});


// Ruta DELETE que elimina un cliente según su ID
app.delete("/clientes/:id", (req, res) => {
  // Ejecuta la consulta SQL para eliminar el cliente
  db.query(
    "DELETE FROM clientes WHERE id=?",
    [req.params.id],
    () => res.send("Cliente eliminado")
  );
});

// Inicia el servidor en el puerto 3001
app.listen(3001, () => {
  console.log("Servidor corriendo en el backend 3001");
});

