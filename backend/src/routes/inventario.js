import express from "express";
import {
  obtenerInventario,
  obtenerMovimientos,
  registrarMovimiento,
  obtenerStockBajo,
  obtenerValorInventario,
  obtenerReporteInventario,
  obtenerMovimientosRecientes
} from "../controllers/inventarioController.js";

const router = express.Router();

// =====================================================
// RUTAS DE INVENTARIO
// =====================================================

// Obtener inventario completo
router.get("/", obtenerInventario);

// Obtener movimientos de inventario (con filtros)
router.get("/movimientos", obtenerMovimientos);

// Obtener movimientos recientes
router.get("/movimientos-recientes", obtenerMovimientosRecientes);

// Registrar movimiento de inventario (entrada/salida/ajuste)
router.post("/movimiento", registrarMovimiento);

// Obtener productos con stock bajo
router.get("/stock-bajo", obtenerStockBajo);

// Obtener valor total del inventario
router.get("/valor-total", obtenerValorInventario);

// Obtener reporte completo de inventario
router.get("/reporte", obtenerReporteInventario);

export default router;