import db from "../config/database.js";

// Obtener todos los productos
export const obtenerProductos = (req, res) => {
  const query = `
    SELECT p.*, c.nombre as categoria, pr.nombre as proveedor 
    FROM productos p
    LEFT JOIN categorias c ON p.categoria_id = c.id
    LEFT JOIN proveedores pr ON p.proveedor_id = pr.id
    WHERE p.activo = 1
    ORDER BY p.nombre
  `;

  db.query(query, (err, result) => {
    if (err) {
      console.error("❌ Error al obtener productos:", err);
      return res.status(500).json([]);
    }
    res.json(result);
  });
};

// Obtener un producto por ID
export const obtenerProductoPorId = (req, res) => {
  const { id } = req.params;

  db.query("SELECT * FROM productos WHERE id=?", [id], (err, result) => {
    if (err) {
      console.error("❌ Error al obtener producto:", err);
      return res.status(500).json({ success: false });
    }
    
    if (result.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: "Producto no encontrado" 
      });
    }

    res.json(result[0]);
  });
};

// Crear nuevo producto
export const crearProducto = (req, res) => {
  const { 
    codigo, nombre, descripcion, categoria_id, proveedor_id,
    precio_compra, precio_venta, stock, stock_minimo, unidad_medida 
  } = req.body;

  if (!nombre || !precio_venta) {
    return res.status(400).json({ 
      success: false, 
      message: "Nombre y precio son obligatorios" 
    });
  }

  const query = `
    INSERT INTO productos 
    (codigo, nombre, descripcion, categoria_id, proveedor_id, precio_compra, precio_venta, stock, stock_minimo, unidad_medida)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  db.query(
    query,
    [codigo, nombre, descripcion, categoria_id, proveedor_id, precio_compra || 0, precio_venta, stock || 0, stock_minimo || 10, unidad_medida || 'unidad'],
    (err, result) => {
      if (err) {
        console.error("❌ Error al crear producto:", err);
        return res.status(500).json({ 
          success: false, 
          message: "Error al crear producto" 
        });
      }

      // Registrar movimiento de inventario si hay stock inicial
      if (stock && stock > 0) {
        db.query(
          "INSERT INTO movimientos_inventario (producto_id, tipo, cantidad, motivo) VALUES (?, 'entrada', ?, 'Stock inicial')",
          [result.insertId, stock]
        );
      }

      res.json({ 
        success: true, 
        message: "Producto creado exitosamente",
        id: result.insertId 
      });
    }
  );
};

// Actualizar producto
export const actualizarProducto = (req, res) => {
  const { id } = req.params;
  const { 
    codigo, nombre, descripcion, categoria_id, proveedor_id,
    precio_compra, precio_venta, stock, stock_minimo, unidad_medida 
  } = req.body;

  const query = `
    UPDATE productos 
    SET codigo=?, nombre=?, descripcion=?, categoria_id=?, proveedor_id=?, 
        precio_compra=?, precio_venta=?, stock=?, stock_minimo=?, unidad_medida=?
    WHERE id=?
  `;

  db.query(
    query,
    [codigo, nombre, descripcion, categoria_id, proveedor_id, precio_compra, precio_venta, stock, stock_minimo, unidad_medida, id],
    (err) => {
      if (err) {
        console.error("❌ Error al actualizar producto:", err);
        return res.status(500).json({ 
          success: false, 
          message: "Error al actualizar" 
        });
      }
      res.json({ 
        success: true, 
        message: "Producto actualizado" 
      });
    }
  );
};

// Eliminar producto (desactivar)
export const eliminarProducto = (req, res) => {
  const { id } = req.params;

  db.query(
    "UPDATE productos SET activo=0 WHERE id=?",
    [id],
    (err) => {
      if (err) {
        console.error("❌ Error al eliminar producto:", err);
        return res.status(500).json({ 
          success: false, 
          message: "Error al eliminar" 
        });
      }
      res.json({ 
        success: true, 
        message: "Producto eliminado" 
      });
    }
  );
};

// Obtener productos con stock bajo
export const productosStockBajo = (req, res) => {
  db.query(
    "SELECT * FROM productos WHERE stock <= stock_minimo AND activo = 1",
    (err, result) => {
      if (err) {
        console.error("❌ Error:", err);
        return res.status(500).json([]);
      }
      res.json(result);
    }
  );
};

// Ajustar stock
export const ajustarStock = (req, res) => {
  const { id } = req.params;
  const { cantidad, tipo, motivo, usuario_id } = req.body;

  if (!cantidad || !tipo) {
    return res.status(400).json({ 
      success: false, 
      message: "Cantidad y tipo son obligatorios" 
    });
  }

  // Obtener stock actual
  db.query("SELECT stock FROM productos WHERE id=?", [id], (err, result) => {
    if (err || result.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: "Producto no encontrado" 
      });
    }

    const stockActual = result[0].stock;
    const nuevoStock = tipo === 'entrada' 
      ? stockActual + parseInt(cantidad)
      : stockActual - parseInt(cantidad);

    if (nuevoStock < 0) {
      return res.status(400).json({ 
        success: false, 
        message: "Stock insuficiente" 
      });
    }

    // Actualizar stock
    db.query("UPDATE productos SET stock=? WHERE id=?", [nuevoStock, id], (err) => {
      if (err) {
        return res.status(500).json({ 
          success: false, 
          message: "Error al actualizar stock" 
        });
      }

      // Registrar movimiento
      db.query(
        "INSERT INTO movimientos_inventario (producto_id, tipo, cantidad, motivo, usuario_id) VALUES (?, ?, ?, ?, ?)",
        [id, tipo, cantidad, motivo || 'Ajuste manual', usuario_id],
        (err) => {
          if (err) {
            console.error("❌ Error al registrar movimiento:", err);
          }
        }
      );

      res.json({ 
        success: true, 
        message: "Stock actualizado",
        nuevoStock 
      });
    });
  });
};
