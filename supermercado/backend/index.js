import express from "express";
import cors from "cors";
import db from "./data.js";

const app = express();
app.use(cors());
app.use(express.json());

// 🔐 LOGIN
app.post("/login", (req, res) => {
  const { usuario, password } = req.body;

  db.query(
    "SELECT * FROM usuarios WHERE usuario=? AND password=?",
    [usuario, password],
    (err, result) => {
      if (err) {
        console.log("❌ Error login:", err);
        return res.status(500).json(false);
      }
      res.json(result.length > 0);
    }
  );
});

// 📦 LISTAR PRODUCTOS
app.get("/productos", (req, res) => {
  db.query("SELECT * FROM productos", (err, result) => {
    if (err) {
      console.log("❌ Error select:", err);
      return res.status(500).json([]);
    }
    res.json(result);
  });
});

// ✅ GUARDAR PRODUCTOS (AQUÍ ESTABA EL ERROR)
app.post("/productos", (req, res) => {
  console.log("📦 BODY:", req.body); // ← CLAVE

  const { nombre, precio, stock } = req.body;

  db.query(
    "INSERT INTO productos (nombre, precio, stock) VALUES (?, ?, ?)",
    [nombre, precio, stock],
    (err, result) => {
      if (err) {
        console.log("❌ Error insert:", err);
        return res.status(500).send("NO se guardó");
      }
      res.send("✅ Producto agregado");
    }
  );
});

// 💰 VENTAS
app.post("/ventas", (req, res) => {
  const { producto, cantidad, total } = req.body;

  db.query(
    "INSERT INTO ventas (producto, cantidad, total, fecha) VALUES (?, ?, ?, NOW())",
    [producto, cantidad, total],
    (err) => {
      if (err) {
        console.log("Error venta:", err);
        return res.status(500).send("Error");
      }
      res.send("Venta registrada");
    }
  );
});

app.delete("/productos/:id", (req, res) => {
  const id = req.params.id;

  db.query(
    "DELETE FROM productos WHERE id = ?",
    [id],
    (err, result) => {
      if (err) {
        console.log(err);
        res.status(500).json({ error: err });
      } else {
        res.json({ mensaje: "Producto eliminado" });
      }
    }
  );
});

app.put("/productos/:id", (req, res) => {
  const id = req.params.id;
  const { nombre, precio, stock } = req.body;

  db.query(
    "UPDATE productos SET nombre=?, precio=?, stock=? WHERE id=?",
    [nombre, precio, stock, id],
    (err, result) => {
      if (err) {
        console.log(err);
        res.status(500).json(err);
      } else {
        res.json({ mensaje: "Producto actualizado" });
      }
    }
  );
});


app.listen(3000, () => {
  console.log("Servidor en http://localhost:3000");
});
