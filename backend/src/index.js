import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import db from "./config/database.js";

// Importar rutas
import usuariosRoutes from "./routes/usuarios.js";
import productosRoutes from "./routes/productos.js";
import ventasRoutes from "./routes/ventas.js";
import catalogosRoutes from "./routes/catalogos.js";
import inventarioRoutes from "./routes/inventario.js"; 

// Configurar variables de entorno
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*'
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Middleware de logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Rutas de API
app.use("/api/usuarios", usuariosRoutes);
app.use("/api/productos", productosRoutes);
app.use("/api/ventas", ventasRoutes);
app.use("/api/catalogos", catalogosRoutes);
app.use("/api/inventario", inventarioRoutes); 

// Ruta raíz
app.get("/", (req, res) => {
  res.json({
    message: "API Esquina del Ahorro",
    version: "2.0.0",
    endpoints: {
      usuarios: "/api/usuarios",
      productos: "/api/productos",
      ventas: "/api/ventas",
      catalogos: "/api/catalogos",
      inventario: "/api/inventario"
    }
  });
});

// Ruta de salud
app.get("/health", (req, res) => {
  res.json({ 
    status: "OK", 
    database: db.state === 'authenticated' ? 'connected' : 'disconnected',
    timestamp: new Date().toISOString() 
  });
});

// Manejo de rutas no encontradas
app.use((req, res) => {
  res.status(404).json({ 
    success: false, 
    message: "Ruta no encontrada" 
  });
});

// Manejo de errores global
app.use((err, req, res, next) => {
  console.error("❌ Error del servidor:", err);
  res.status(500).json({ 
    success: false, 
    message: "Error interno del servidor" 
  });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════╗
║  🏪 Esquina del Ahorro - Backend      ║
║  🚀 Servidor corriendo en puerto ${PORT}  ║
║  📡 http://localhost:${PORT}             ║
╚════════════════════════════════════════╝
  `);
});

export default app;
