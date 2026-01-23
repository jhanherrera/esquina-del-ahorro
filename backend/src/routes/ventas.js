import express from "express";
import {
  crearVenta,
  obtenerVentas,
  obtenerDetalleVenta,
  anularVenta,
  reporteVentas,
  productosMasVendidos
} from "../controllers/ventasController.js";

const router = express.Router();

router.post("/", crearVenta);
router.get("/", obtenerVentas);
router.get("/reporte", reporteVentas);
router.get("/productos-mas-vendidos", productosMasVendidos);
router.get("/:id", obtenerDetalleVenta);
router.put("/:id/anular", anularVenta);

export default router;
