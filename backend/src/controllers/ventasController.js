import db from "../config/database.js";

// Crear venta
export const crearVenta = (req, res) => {
  const { cliente_id, usuario_id, productos, metodo_pago, descuento, notas } = req.body;

  if (!productos || productos.length === 0) {
    return res.status(400).json({ 
      success: false, 
      message: "Debe incluir al menos un producto" 
    });
  }

  // Calcular totales
  let subtotal = 0;
  productos.forEach(p => {
    subtotal += p.cantidad * p.precio_unitario;
  });

  const descuentoValor = descuento || 0;
  const impuesto = subtotal * 0.18; // IGV 18%
  const total = subtotal - descuentoValor + impuesto;

  // Generar número de venta
  const numeroVenta = `V-${Date.now()}`;

  // Insertar venta
  const queryVenta = `
    INSERT INTO ventas 
    (numero_venta, cliente_id, usuario_id, subtotal, descuento, impuesto, total, metodo_pago, notas)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  db.query(
    queryVenta,
    [numeroVenta, cliente_id, usuario_id, subtotal, descuentoValor, impuesto, total, metodo_pago || 'efectivo', notas],
    (err, result) => {
      if (err) {
        console.error("❌ Error al crear venta:", err);
        return res.status(500).json({ 
          success: false, 
          message: "Error al crear venta" 
        });
      }

      const ventaId = result.insertId;

      // Insertar detalles y actualizar stock
      const detallesPromises = productos.map(producto => {
        return new Promise((resolve, reject) => {
          // Insertar detalle
          const subtotalProducto = producto.cantidad * producto.precio_unitario;
          db.query(
            "INSERT INTO ventas_detalle (venta_id, producto_id, cantidad, precio_unitario, subtotal) VALUES (?, ?, ?, ?, ?)",
            [ventaId, producto.producto_id, producto.cantidad, producto.precio_unitario, subtotalProducto],
            (err) => {
              if (err) return reject(err);

              // Actualizar stock
              db.query(
                "UPDATE productos SET stock = stock - ? WHERE id = ?",
                [producto.cantidad, producto.producto_id],
                (err) => {
                  if (err) return reject(err);

                  // Registrar movimiento de inventario
                  db.query(
                    "INSERT INTO movimientos_inventario (producto_id, tipo, cantidad, motivo) VALUES (?, 'salida', ?, ?)",
                    [producto.producto_id, producto.cantidad, `Venta ${numeroVenta}`],
                    (err) => {
                      if (err) console.error("Error al registrar movimiento:", err);
                      resolve();
                    }
                  );
                });
            }
          );
        });
      });

      Promise.all(detallesPromises)
        .then(() => {
          res.json({ 
            success: true, 
            message: "Venta registrada exitosamente",
            venta_id: ventaId,
            numero_venta: numeroVenta,
            total 
          });
        })
        .catch(err => {
          console.error("❌ Error en detalles:", err);
          res.status(500).json({ 
            success: false, 
            message: "Error al procesar detalles" 
          });
        });
    }
  );
};

// Obtener todas las ventas
export const obtenerVentas = (req, res) => {
  const { fecha_inicio, fecha_fin } = req.query;

  let query = `
    SELECT v.*, c.nombre as cliente, u.nombre_completo as vendedor
    FROM ventas v
    LEFT JOIN clientes c ON v.cliente_id = c.id
    INNER JOIN usuarios u ON v.usuario_id = u.id
    WHERE 1=1
  `;

  const params = [];

  if (fecha_inicio && fecha_fin) {
    query += " AND DATE(v.fecha) BETWEEN ? AND ?";
    params.push(fecha_inicio, fecha_fin);
  }

  query += " ORDER BY v.fecha DESC LIMIT 100";

  db.query(query, params, (err, result) => {
    if (err) {
      console.error("❌ Error al obtener ventas:", err);
      return res.status(500).json([]);
    }
    res.json(result);
  });
};

// Obtener detalle de venta
export const obtenerDetalleVenta = (req, res) => {
  const { id } = req.params;

  const query = `
    SELECT vd.*, p.nombre as producto
    FROM ventas_detalle vd
    INNER JOIN productos p ON vd.producto_id = p.id
    WHERE vd.venta_id = ?
  `;

  db.query(query, [id], (err, result) => {
    if (err) {
      console.error("❌ Error:", err);
      return res.status(500).json([]);
    }
    res.json(result);
  });
};

// Anular venta
export const anularVenta = (req, res) => {
  const { id } = req.params;

  // Obtener detalles de la venta
  db.query("SELECT * FROM ventas_detalle WHERE venta_id=?", [id], (err, detalles) => {
    if (err) {
      return res.status(500).json({ 
        success: false, 
        message: "Error al obtener detalles" 
      });
    }

    // Devolver stock
    const promesas = detalles.map(detalle => {
      return new Promise((resolve, reject) => {
        db.query(
          "UPDATE productos SET stock = stock + ? WHERE id = ?",
          [detalle.cantidad, detalle.producto_id],
          (err) => {
            if (err) return reject(err);
            resolve();
          }
        );
      });
    });

    Promise.all(promesas)
      .then(() => {
        // Anular venta
        db.query("UPDATE ventas SET estado='anulada' WHERE id=?", [id], (err) => {
          if (err) {
            return res.status(500).json({ 
              success: false, 
              message: "Error al anular" 
            });
          }
          res.json({ 
            success: true, 
            message: "Venta anulada y stock devuelto" 
          });
        });
      })
      .catch(err => {
        console.error("❌ Error:", err);
        res.status(500).json({ 
          success: false, 
          message: "Error al devolver stock" 
        });
      });
  });
};

// Reporte de ventas por período
export const reporteVentas = (req, res) => {
  const { fecha_inicio, fecha_fin } = req.query;

  const query = `
    SELECT 
      DATE(fecha) as fecha,
      COUNT(*) as total_ventas,
      SUM(total) as total_ingresos,
      AVG(total) as promedio_venta
    FROM ventas
    WHERE estado = 'completada'
    AND DATE(fecha) BETWEEN ? AND ?
    GROUP BY DATE(fecha)
    ORDER BY fecha DESC
  `;

  db.query(query, [fecha_inicio, fecha_fin], (err, result) => {
    if (err) {
      console.error("❌ Error:", err);
      return res.status(500).json([]);
    }
    res.json(result);
  });
};

// Productos más vendidos
export const productosMasVendidos = (req, res) => {
  const query = `
    SELECT 
      p.id, p.nombre, p.precio_venta,
      SUM(vd.cantidad) as cantidad_vendida,
      SUM(vd.subtotal) as total_ventas
    FROM ventas_detalle vd
    INNER JOIN productos p ON vd.producto_id = p.id
    INNER JOIN ventas v ON vd.venta_id = v.id
    WHERE v.estado = 'completada'
    AND DATE(v.fecha) >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
    GROUP BY p.id
    ORDER BY cantidad_vendida DESC
    LIMIT 10
  `;

  db.query(query, (err, result) => {
    if (err) {
      console.error("❌ Error:", err);
      return res.status(500).json([]);
    }
    res.json(result);
  });
};
