import db from "../config/database.js";

// =====================================================
// OBTENER INVENTARIO COMPLETO
// =====================================================
export const obtenerInventario = (req, res) => {
  const query = `
    SELECT 
      p.id,
      p.codigo,
      p.nombre,
      p.descripcion,
      p.stock,
      p.stock_minimo,
      p.precio_compra,
      p.precio_venta,
      p.unidad_medida,
      p.activo,
      c.nombre as categoria,
      pr.nombre as proveedor,
      CASE 
        WHEN p.stock <= p.stock_minimo THEN 'bajo'
        WHEN p.stock <= p.stock_minimo * 2 THEN 'medio'
        ELSE 'normal'
      END as estado_stock,
      (p.stock * p.precio_compra) as valor_stock
    FROM productos p
    LEFT JOIN categorias c ON p.categoria_id = c.id
    LEFT JOIN proveedores pr ON p.proveedor_id = pr.id
    WHERE p.activo = 1
    ORDER BY p.nombre ASC
  `;

  db.query(query, (err, results) => {
    if (err) {
      console.error("Error al obtener inventario:", err);
      return res.status(500).json({
        success: false,
        message: "Error al obtener inventario"
      });
    }

    res.json({
      success: true,
      data: results
    });
  });
};

// =====================================================
// OBTENER MOVIMIENTOS DE INVENTARIO
// =====================================================
export const obtenerMovimientos = (req, res) => {
  const { producto_id, fecha_inicio, fecha_fin, tipo, limit = 100 } = req.query;

  let query = `
    SELECT 
      mi.id,
      mi.tipo,
      mi.cantidad,
      mi.motivo,
      mi.fecha,
      p.nombre as producto,
      p.codigo as codigo_producto,
      u.nombre_completo as usuario
    FROM movimientos_inventario mi
    INNER JOIN productos p ON mi.producto_id = p.id
    LEFT JOIN usuarios u ON mi.usuario_id = u.id
    WHERE 1=1
  `;

  const params = [];

  // Filtros opcionales
  if (producto_id) {
    query += " AND mi.producto_id = ?";
    params.push(producto_id);
  }

  if (fecha_inicio) {
    query += " AND DATE(mi.fecha) >= ?";
    params.push(fecha_inicio);
  }

  if (fecha_fin) {
    query += " AND DATE(mi.fecha) <= ?";
    params.push(fecha_fin);
  }

  if (tipo) {
    query += " AND mi.tipo = ?";
    params.push(tipo);
  }

  query += " ORDER BY mi.fecha DESC LIMIT ?";
  params.push(parseInt(limit));

  db.query(query, params, (err, results) => {
    if (err) {
      console.error("Error al obtener movimientos:", err);
      return res.status(500).json({
        success: false,
        message: "Error al obtener movimientos"
      });
    }

    res.json({
      success: true,
      data: results
    });
  });
};

// =====================================================
// REGISTRAR MOVIMIENTO DE INVENTARIO
// =====================================================
export const registrarMovimiento = (req, res) => {
  const { producto_id, tipo, cantidad, motivo, usuario_id } = req.body;

  // Validaciones
  if (!producto_id || !tipo || !cantidad) {
    return res.status(400).json({
      success: false,
      message: "Faltan datos obligatorios: producto_id, tipo, cantidad"
    });
  }

  if (!['entrada', 'salida', 'ajuste'].includes(tipo)) {
    return res.status(400).json({
      success: false,
      message: "Tipo de movimiento inválido. Debe ser: entrada, salida o ajuste"
    });
  }

  if (cantidad <= 0) {
    return res.status(400).json({
      success: false,
      message: "La cantidad debe ser mayor a 0"
    });
  }

  // Verificar que el producto existe
  const verificarQuery = "SELECT id, stock, nombre FROM productos WHERE id = ? AND activo = 1";
  
  db.query(verificarQuery, [producto_id], (err, results) => {
    if (err) {
      console.error("Error al verificar producto:", err);
      return res.status(500).json({
        success: false,
        message: "Error al verificar producto"
      });
    }

    if (results.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Producto no encontrado o inactivo"
      });
    }

    const producto = results[0];
    const stockActual = producto.stock;

    // Calcular nuevo stock
    let nuevoStock;
    if (tipo === 'entrada' || tipo === 'ajuste') {
      nuevoStock = stockActual + parseInt(cantidad);
    } else if (tipo === 'salida') {
      nuevoStock = stockActual - parseInt(cantidad);
      
      // Verificar que no quede en negativo
      if (nuevoStock < 0) {
        return res.status(400).json({
          success: false,
          message: `Stock insuficiente. Stock actual: ${stockActual}, intentando retirar: ${cantidad}`
        });
      }
    }

    // Iniciar transacción
    db.beginTransaction((err) => {
      if (err) {
        console.error("Error al iniciar transacción:", err);
        return res.status(500).json({
          success: false,
          message: "Error al procesar movimiento"
        });
      }

      // 1. Insertar movimiento
      const insertMovimiento = `
        INSERT INTO movimientos_inventario 
        (producto_id, tipo, cantidad, motivo, usuario_id, fecha)
        VALUES (?, ?, ?, ?, ?, NOW())
      `;

      db.query(insertMovimiento, [producto_id, tipo, cantidad, motivo, usuario_id], (err, result) => {
        if (err) {
          return db.rollback(() => {
            console.error("Error al insertar movimiento:", err);
            res.status(500).json({
              success: false,
              message: "Error al registrar movimiento"
            });
          });
        }

        // 2. Actualizar stock del producto
        const updateStock = "UPDATE productos SET stock = ? WHERE id = ?";

        db.query(updateStock, [nuevoStock, producto_id], (err) => {
          if (err) {
            return db.rollback(() => {
              console.error("Error al actualizar stock:", err);
              res.status(500).json({
                success: false,
                message: "Error al actualizar stock"
              });
            });
          }

          // Confirmar transacción
          db.commit((err) => {
            if (err) {
              return db.rollback(() => {
                console.error("Error al confirmar transacción:", err);
                res.status(500).json({
                  success: false,
                  message: "Error al confirmar operación"
                });
              });
            }

            res.json({
              success: true,
              message: `Movimiento de ${tipo} registrado exitosamente`,
              data: {
                movimiento_id: result.insertId,
                producto: producto.nombre,
                stock_anterior: stockActual,
                stock_nuevo: nuevoStock,
                diferencia: tipo === 'salida' ? -cantidad : cantidad
              }
            });
          });
        });
      });
    });
  });
};

// =====================================================
// OBTENER PRODUCTOS CON STOCK BAJO
// =====================================================
export const obtenerStockBajo = (req, res) => {
  const query = `
    SELECT 
      p.id,
      p.codigo,
      p.nombre,
      p.stock,
      p.stock_minimo,
      p.precio_compra,
      p.precio_venta,
      c.nombre as categoria,
      pr.nombre as proveedor,
      pr.telefono as telefono_proveedor,
      (p.stock_minimo - p.stock) as cantidad_requerida,
      ((p.stock_minimo - p.stock) * p.precio_compra) as costo_reabastecimiento
    FROM productos p
    LEFT JOIN categorias c ON p.categoria_id = c.id
    LEFT JOIN proveedores pr ON p.proveedor_id = pr.id
    WHERE p.stock <= p.stock_minimo 
      AND p.activo = 1
    ORDER BY (p.stock_minimo - p.stock) DESC
  `;

  db.query(query, (err, results) => {
    if (err) {
      console.error("Error al obtener productos con stock bajo:", err);
      return res.status(500).json({
        success: false,
        message: "Error al obtener productos con stock bajo"
      });
    }

    res.json({
      success: true,
      total: results.length,
      data: results
    });
  });
};

// =====================================================
// OBTENER VALOR TOTAL DEL INVENTARIO
// =====================================================
export const obtenerValorInventario = (req, res) => {
  const query = `
    SELECT 
      COUNT(*) as total_productos,
      SUM(stock) as total_unidades,
      SUM(stock * precio_compra) as valor_compra,
      SUM(stock * precio_venta) as valor_venta,
      (SUM(stock * precio_venta) - SUM(stock * precio_compra)) as utilidad_potencial,
      SUM(CASE WHEN stock <= stock_minimo THEN 1 ELSE 0 END) as productos_stock_bajo
    FROM productos
    WHERE activo = 1
  `;

  db.query(query, (err, results) => {
    if (err) {
      console.error("Error al calcular valor del inventario:", err);
      return res.status(500).json({
        success: false,
        message: "Error al calcular valor del inventario"
      });
    }

    const datos = results[0];

    res.json({
      success: true,
      data: {
        total_productos: datos.total_productos || 0,
        total_unidades: datos.total_unidades || 0,
        valor_compra: parseFloat(datos.valor_compra || 0).toFixed(2),
        valor_venta: parseFloat(datos.valor_venta || 0).toFixed(2),
        utilidad_potencial: parseFloat(datos.utilidad_potencial || 0).toFixed(2),
        productos_stock_bajo: datos.productos_stock_bajo || 0
      }
    });
  });
};

// =====================================================
// OBTENER REPORTE COMPLETO DE INVENTARIO
// =====================================================
export const obtenerReporteInventario = (req, res) => {
  // Consulta para resumen general
  const queryResumen = `
    SELECT 
      COUNT(*) as total_productos,
      SUM(stock) as total_unidades,
      SUM(stock * precio_compra) as valor_total,
      AVG(stock) as promedio_stock
    FROM productos
    WHERE activo = 1
  `;

  // Consulta para productos por categoría
  const queryPorCategoria = `
    SELECT 
      c.nombre as categoria,
      COUNT(p.id) as cantidad_productos,
      SUM(p.stock) as total_stock,
      SUM(p.stock * p.precio_compra) as valor_inventario
    FROM productos p
    LEFT JOIN categorias c ON p.categoria_id = c.id
    WHERE p.activo = 1
    GROUP BY c.id, c.nombre
    ORDER BY valor_inventario DESC
  `;

  // Consulta para productos más valiosos
  const queryProductosValiosos = `
    SELECT 
      p.nombre,
      p.codigo,
      p.stock,
      p.precio_compra,
      (p.stock * p.precio_compra) as valor_total
    FROM productos p
    WHERE p.activo = 1
    ORDER BY valor_total DESC
    LIMIT 10
  `;

  // Ejecutar todas las consultas
  db.query(queryResumen, (err, resumen) => {
    if (err) {
      console.error("Error en reporte - resumen:", err);
      return res.status(500).json({
        success: false,
        message: "Error al generar reporte"
      });
    }

    db.query(queryPorCategoria, (err, porCategoria) => {
      if (err) {
        console.error("Error en reporte - categorías:", err);
        return res.status(500).json({
          success: false,
          message: "Error al generar reporte"
        });
      }

      db.query(queryProductosValiosos, (err, productosValiosos) => {
        if (err) {
          console.error("Error en reporte - productos valiosos:", err);
          return res.status(500).json({
            success: false,
            message: "Error al generar reporte"
          });
        }

        res.json({
          success: true,
          data: {
            resumen: resumen[0],
            por_categoria: porCategoria,
            productos_mas_valiosos: productosValiosos,
            fecha_reporte: new Date().toISOString()
          }
        });
      });
    });
  });
};

// =====================================================
// OBTENER MOVIMIENTOS RECIENTES
// =====================================================
export const obtenerMovimientosRecientes = (req, res) => {
  const limit = req.query.limit || 20;

  const query = `
    SELECT 
      mi.id,
      mi.tipo,
      mi.cantidad,
      mi.motivo,
      mi.fecha,
      p.nombre as producto,
      p.codigo,
      u.nombre_completo as usuario
    FROM movimientos_inventario mi
    INNER JOIN productos p ON mi.producto_id = p.id
    LEFT JOIN usuarios u ON mi.usuario_id = u.id
    ORDER BY mi.fecha DESC
    LIMIT ?
  `;

  db.query(query, [parseInt(limit)], (err, results) => {
    if (err) {
      console.error("Error al obtener movimientos recientes:", err);
      return res.status(500).json({
        success: false,
        message: "Error al obtener movimientos recientes"
      });
    }

    res.json({
      success: true,
      data: results
    });
  });
};