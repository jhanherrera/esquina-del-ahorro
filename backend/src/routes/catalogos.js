import express from "express";
import {
  obtenerCategorias,
  crearCategoria,
  obtenerProveedores,
  crearProveedor,
  obtenerClientes,
  crearCliente
} from "../controllers/catalogosController.js";

const router = express.Router();

// Categorías
router.get("/categorias", obtenerCategorias);
router.post("/categorias", crearCategoria);

// Proveedores
router.get("/proveedores", obtenerProveedores);
router.post("/proveedores", crearProveedor);

// Clientes
router.get("/clientes", obtenerClientes);
router.post("/clientes", crearCliente);

export default router;
