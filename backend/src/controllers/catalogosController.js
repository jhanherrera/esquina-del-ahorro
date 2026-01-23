import db from "../config/database.js";

// Obtener todas las categorías
export const obtenerCategorias = (req, res) => {
  db.query("SELECT * FROM categorias WHERE activo=1", (err, result) => {
    if (err) {
      console.error("❌ Error:", err);
      return res.status(500).json([]);
    }
    res.json(result);
  });
};

// Crear categoría
export const crearCategoria = (req, res) => {
  const { nombre, descripcion } = req.body;

  db.query(
    "INSERT INTO categorias (nombre, descripcion) VALUES (?, ?)",
    [nombre, descripcion],
    (err, result) => {
      if (err) {
        console.error("❌ Error:", err);
        return res.status(500).json({ success: false });
      }
      res.json({ 
        success: true, 
        message: "Categoría creada",
        id: result.insertId 
      });
    }
  );
};

// Obtener todos los proveedores
export const obtenerProveedores = (req, res) => {
  db.query("SELECT * FROM proveedores WHERE activo=1", (err, result) => {
    if (err) {
      console.error("❌ Error:", err);
      return res.status(500).json([]);
    }
    res.json(result);
  });
};

// Crear proveedor
export const crearProveedor = (req, res) => {
  const { nombre, ruc_nit, direccion, telefono, email, contacto_nombre } = req.body;

  db.query(
    "INSERT INTO proveedores (nombre, ruc_nit, direccion, telefono, email, contacto_nombre) VALUES (?, ?, ?, ?, ?, ?)",
    [nombre, ruc_nit, direccion, telefono, email, contacto_nombre],
    (err, result) => {
      if (err) {
        console.error("❌ Error:", err);
        return res.status(500).json({ success: false });
      }
      res.json({ 
        success: true, 
        message: "Proveedor creado",
        id: result.insertId 
      });
    }
  );
};

// Obtener todos los clientes
export const obtenerClientes = (req, res) => {
  db.query("SELECT * FROM clientes WHERE activo=1", (err, result) => {
    if (err) {
      console.error("❌ Error:", err);
      return res.status(500).json([]);
    }
    res.json(result);
  });
};

// Crear cliente
export const crearCliente = (req, res) => {
  const { nombre, documento, tipo_documento, telefono, email, direccion } = req.body;

  db.query(
    "INSERT INTO clientes (nombre, documento, tipo_documento, telefono, email, direccion) VALUES (?, ?, ?, ?, ?, ?)",
    [nombre, documento, tipo_documento, telefono, email, direccion],
    (err, result) => {
      if (err) {
        console.error("❌ Error:", err);
        return res.status(500).json({ success: false });
      }
      res.json({ 
        success: true, 
        message: "Cliente creado",
        id: result.insertId 
      });
    }
  );
};
