-- =====================================================
-- ESQUEMA DE BASE DE DATOS - ESQUINA DEL AHORRO
-- Sistema de Gestión de Inventario y Contabilidad
-- =====================================================

CREATE DATABASE IF NOT EXISTS supermercado;
USE supermercado;

-- =====================================================
-- MÓDULO DE USUARIOS Y ROLES
-- =====================================================

-- Tabla de roles
CREATE TABLE IF NOT EXISTS roles (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(50) NOT NULL UNIQUE,
  descripcion TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de usuarios
CREATE TABLE IF NOT EXISTS usuarios (
  id INT AUTO_INCREMENT PRIMARY KEY,
  usuario VARCHAR(50) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  nombre_completo VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE,
  telefono VARCHAR(20),
  rol_id INT DEFAULT 2,
  activo BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (rol_id) REFERENCES roles(id)
);

-- =====================================================
-- MÓDULO DE PRODUCTOS E INVENTARIO
-- =====================================================

-- Tabla de categorías de productos
CREATE TABLE IF NOT EXISTS categorias (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL UNIQUE,
  descripcion TEXT,
  activo BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de proveedores
CREATE TABLE IF NOT EXISTS proveedores (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  ruc_nit VARCHAR(20) UNIQUE,
  direccion TEXT,
  telefono VARCHAR(20),
  email VARCHAR(100),
  contacto_nombre VARCHAR(100),
  activo BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Tabla de productos
CREATE TABLE IF NOT EXISTS productos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  codigo VARCHAR(50) UNIQUE,
  nombre VARCHAR(150) NOT NULL,
  descripcion TEXT,
  categoria_id INT,
  proveedor_id INT,
  precio_compra DECIMAL(10, 2) NOT NULL DEFAULT 0,
  precio_venta DECIMAL(10, 2) NOT NULL,
  stock INT NOT NULL DEFAULT 0,
  stock_minimo INT DEFAULT 10,
  unidad_medida VARCHAR(20) DEFAULT 'unidad',
  imagen_url VARCHAR(255),
  activo BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (categoria_id) REFERENCES categorias(id),
  FOREIGN KEY (proveedor_id) REFERENCES proveedores(id)
);

-- Tabla de movimientos de inventario (entrada/salida)
CREATE TABLE IF NOT EXISTS movimientos_inventario (
  id INT AUTO_INCREMENT PRIMARY KEY,
  producto_id INT NOT NULL,
  tipo ENUM('entrada', 'salida', 'ajuste') NOT NULL,
  cantidad INT NOT NULL,
  motivo VARCHAR(255),
  usuario_id INT,
  fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (producto_id) REFERENCES productos(id),
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
);

-- =====================================================
-- MÓDULO DE VENTAS
-- =====================================================

-- Tabla de clientes
CREATE TABLE IF NOT EXISTS clientes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  documento VARCHAR(20),
  tipo_documento ENUM('DNI', 'RUC', 'Pasaporte', 'Otro') DEFAULT 'DNI',
  telefono VARCHAR(20),
  email VARCHAR(100),
  direccion TEXT,
  activo BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Tabla de ventas (cabecera)
CREATE TABLE IF NOT EXISTS ventas (
  id INT AUTO_INCREMENT PRIMARY KEY,
  numero_venta VARCHAR(20) UNIQUE,
  cliente_id INT,
  usuario_id INT NOT NULL,
  subtotal DECIMAL(10, 2) NOT NULL,
  descuento DECIMAL(10, 2) DEFAULT 0,
  impuesto DECIMAL(10, 2) DEFAULT 0,
  total DECIMAL(10, 2) NOT NULL,
  metodo_pago ENUM('efectivo', 'tarjeta', 'transferencia', 'credito') DEFAULT 'efectivo',
  estado ENUM('pendiente', 'completada', 'anulada') DEFAULT 'completada',
  notas TEXT,
  fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (cliente_id) REFERENCES clientes(id),
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
);

-- Tabla de detalle de ventas
CREATE TABLE IF NOT EXISTS ventas_detalle (
  id INT AUTO_INCREMENT PRIMARY KEY,
  venta_id INT NOT NULL,
  producto_id INT NOT NULL,
  cantidad INT NOT NULL,
  precio_unitario DECIMAL(10, 2) NOT NULL,
  subtotal DECIMAL(10, 2) NOT NULL,
  FOREIGN KEY (venta_id) REFERENCES ventas(id) ON DELETE CASCADE,
  FOREIGN KEY (producto_id) REFERENCES productos(id)
);

-- =====================================================
-- MÓDULO DE COMPRAS
-- =====================================================

-- Tabla de compras (cabecera)
CREATE TABLE IF NOT EXISTS compras (
  id INT AUTO_INCREMENT PRIMARY KEY,
  numero_compra VARCHAR(20) UNIQUE,
  proveedor_id INT NOT NULL,
  usuario_id INT NOT NULL,
  subtotal DECIMAL(10, 2) NOT NULL,
  impuesto DECIMAL(10, 2) DEFAULT 0,
  total DECIMAL(10, 2) NOT NULL,
  estado ENUM('pendiente', 'recibida', 'anulada') DEFAULT 'pendiente',
  notas TEXT,
  fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (proveedor_id) REFERENCES proveedores(id),
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
);

-- Tabla de detalle de compras
CREATE TABLE IF NOT EXISTS compras_detalle (
  id INT AUTO_INCREMENT PRIMARY KEY,
  compra_id INT NOT NULL,
  producto_id INT NOT NULL,
  cantidad INT NOT NULL,
  precio_unitario DECIMAL(10, 2) NOT NULL,
  subtotal DECIMAL(10, 2) NOT NULL,
  FOREIGN KEY (compra_id) REFERENCES compras(id) ON DELETE CASCADE,
  FOREIGN KEY (producto_id) REFERENCES productos(id)
);

-- =====================================================
-- MÓDULO DE CONTABILIDAD Y CAJA
-- =====================================================

-- Tabla de caja (apertura y cierre)
CREATE TABLE IF NOT EXISTS caja (
  id INT AUTO_INCREMENT PRIMARY KEY,
  usuario_id INT NOT NULL,
  monto_inicial DECIMAL(10, 2) NOT NULL,
  monto_final DECIMAL(10, 2),
  estado ENUM('abierta', 'cerrada') DEFAULT 'abierta',
  fecha_apertura TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  fecha_cierre TIMESTAMP NULL,
  notas TEXT,
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
);

-- Tabla de movimientos de caja
CREATE TABLE IF NOT EXISTS movimientos_caja (
  id INT AUTO_INCREMENT PRIMARY KEY,
  caja_id INT NOT NULL,
  tipo ENUM('ingreso', 'egreso') NOT NULL,
  concepto VARCHAR(255) NOT NULL,
  monto DECIMAL(10, 2) NOT NULL,
  metodo_pago ENUM('efectivo', 'tarjeta', 'transferencia') DEFAULT 'efectivo',
  referencia VARCHAR(100),
  venta_id INT,
  compra_id INT,
  usuario_id INT NOT NULL,
  fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (caja_id) REFERENCES caja(id),
  FOREIGN KEY (venta_id) REFERENCES ventas(id),
  FOREIGN KEY (compra_id) REFERENCES compras(id),
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
);

-- Tabla de gastos
CREATE TABLE IF NOT EXISTS gastos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  categoria VARCHAR(100) NOT NULL,
  descripcion TEXT NOT NULL,
  monto DECIMAL(10, 2) NOT NULL,
  metodo_pago ENUM('efectivo', 'tarjeta', 'transferencia') DEFAULT 'efectivo',
  usuario_id INT NOT NULL,
  fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
);

-- =====================================================
-- DATOS INICIALES
-- =====================================================

-- Insertar roles por defecto
INSERT INTO roles (nombre, descripcion) VALUES
('Administrador', 'Acceso completo al sistema'),
('Cajero', 'Puede realizar ventas y consultar productos'),
('Almacenero', 'Gestiona inventario y compras');

-- Insertar usuario administrador por defecto
-- Password: admin123 (deberías usar bcrypt en producción)
INSERT INTO usuarios (usuario, password, nombre_completo, email, rol_id) VALUES
('admin', 'admin123', 'Administrador del Sistema', 'admin@esquinadelahorro.com', 1),
('cajero', 'cajero123', 'Cajero Principal', 'cajero@esquinadelahorro.com', 2);

-- Insertar categorías por defecto
INSERT INTO categorias (nombre, descripcion) VALUES
('Abarrotes', 'Productos de despensa y alimentos básicos'),
('Bebidas', 'Bebidas alcohólicas y no alcohólicas'),
('Lácteos', 'Leche, quesos, yogurt, etc.'),
('Carnes y Embutidos', 'Productos cárnicos'),
('Limpieza', 'Productos de limpieza del hogar'),
('Higiene Personal', 'Productos de cuidado personal'),
('Snacks', 'Golosinas y aperitivos'),
('Frutas y Verduras', 'Productos frescos');

-- Insertar proveedor de ejemplo
INSERT INTO proveedores (nombre, ruc_nit, telefono, email, contacto_nombre) VALUES
('Distribuidora Central', '20123456789', '987654321', 'ventas@distcentral.com', 'Juan Pérez');

-- Insertar productos de ejemplo
INSERT INTO productos (codigo, nombre, categoria_id, proveedor_id, precio_compra, precio_venta, stock, stock_minimo) VALUES
('P001', 'Arroz Costeño 1kg', 1, 1, 3.50, 4.80, 50, 10),
('P002', 'Aceite Primor 1L', 1, 1, 8.00, 10.50, 30, 5),
('P003', 'Leche Gloria 1L', 3, 1, 3.80, 4.50, 40, 10),
('P004', 'Coca Cola 2L', 2, 1, 5.00, 7.00, 60, 15),
('P005', 'Pan Bimbo Integral', 1, 1, 4.50, 6.00, 25, 8);

-- =====================================================
-- ÍNDICES PARA MEJORAR RENDIMIENTO
-- =====================================================

CREATE INDEX idx_productos_categoria ON productos(categoria_id);
CREATE INDEX idx_productos_proveedor ON productos(proveedor_id);
CREATE INDEX idx_ventas_fecha ON ventas(fecha);
CREATE INDEX idx_ventas_usuario ON ventas(usuario_id);
CREATE INDEX idx_compras_fecha ON compras(fecha);
CREATE INDEX idx_movimientos_caja_fecha ON movimientos_caja(fecha);
