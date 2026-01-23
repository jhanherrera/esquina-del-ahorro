import express from "express";
import {
  obtenerProductos,
  obtenerProductoPorId,
  crearProducto,
  actualizarProducto,
  eliminarProducto,
  productosStockBajo,
  ajustarStock
} from "../controllers/productosController.js";

const router = express.Router();

router.get("/", obtenerProductos);
router.get("/stock-bajo", productosStockBajo);
router.get("/:id", obtenerProductoPorId);
router.post("/", crearProducto);
router.put("/:id", actualizarProducto);
router.delete("/:id", eliminarProducto);
router.post("/:id/ajustar-stock", ajustarStock);

export default router;
