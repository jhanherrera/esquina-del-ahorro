# 🏪 Esquina del Ahorro - Sistema de Gestión

> Sistema completo de gestión de inventario, ventas y contabilidad para supermercados y tiendas

[![Node.js](https://img.shields.io/badge/Node.js-v18+-green.svg)](https://nodejs.org/)
[![MySQL](https://img.shields.io/badge/MySQL-8.0+-blue.svg)](https://www.mysql.com/)
[![License](https://img.shields.io/badge/license-ISC-orange.svg)](LICENSE)

## 📋 Tabla de Contenidos

- [Características](#-características)
- [Tecnologías](#-tecnologías)
- [Requisitos](#-requisitos)
- [Instalación](#-instalación)
- [Configuración](#-configuración)
- [Uso](#-uso)
- [Estructura del Proyecto](#-estructura-del-proyecto)
- [API Endpoints](#-api-endpoints)
- [Esquema de Base de Datos](#-esquema-de-base-de-datos)
- [Roadmap](#-roadmap)
- [Contribuir](#-contribuir)

## ✨ Características

### Gestión de Inventario
- ✅ Alta, baja y modificación de productos
- ✅ Control de stock con alertas de stock mínimo
- ✅ Categorización de productos
- ✅ Gestión de proveedores
- ✅ Registro de movimientos de inventario
- ✅ Búsqueda y filtrado de productos

### Sistema de Ventas
- ✅ Punto de venta (POS)
- ✅ Registro de ventas con múltiples productos
- ✅ Gestión de clientes
- ✅ Múltiples métodos de pago
- ✅ Anulación de ventas
- ✅ Historial de ventas

### Reportes y Contabilidad
- ✅ Dashboard con estadísticas en tiempo real
- ✅ Reportes de ventas por período
- ✅ Productos más vendidos
- ✅ Control de caja (apertura/cierre)
- ✅ Registro de gastos
- ✅ Movimientos de caja

### Administración
- ✅ Sistema de usuarios con roles
- ✅ Autenticación segura
- ✅ Gestión de permisos
- ✅ Auditoría de acciones

## 🛠️ Tecnologías

### Backend
- **Node.js** - Entorno de ejecución
- **Express.js** - Framework web
- **MySQL2** - Base de datos
- **dotenv** - Variables de entorno
- **CORS** - Control de acceso

### Frontend
- **HTML5** - Estructura
- **CSS3** - Estilos modernos
- **JavaScript ES6+** - Lógica del cliente
- **Fetch API** - Comunicación con backend

## 📦 Requisitos

Antes de comenzar, asegúrate de tener instalado:

- [Node.js](https://nodejs.org/) (v18 o superior)
- [MySQL](https://www.mysql.com/) (v8.0 o superior)
- [Git](https://git-scm.com/)

## 🚀 Instalación

### 1. Clonar el repositorio

```bash
git clone https://github.com/jhanherrera/esquina-del-ahorro.git
cd esquina-del-ahorro
```

### 2. Configurar la Base de Datos

```bash
# Acceder a MySQL
mysql -u root -p

# Ejecutar el script de creación
mysql -u root -p < database/schema.sql
```

O importar manualmente el archivo `database/schema.sql` desde MySQL Workbench.

### 3. Instalar dependencias del Backend

```bash
cd backend
npm install
```

### 4. Configurar variables de entorno

```bash
# Copiar archivo de ejemplo
cp .env.example .env

# Editar .env con tus credenciales
nano .env
```

Configurar el archivo `.env`:

```env
PORT=3000
NODE_ENV=development

DB_HOST=localhost
DB_USER=root
DB_PASSWORD=tu_password
DB_NAME=supermercado
DB_PORT=3306

JWT_SECRET=tu_clave_secreta_super_segura

CORS_ORIGIN=http://localhost:5500
```

### 5. Iniciar el servidor Backend

```bash
# Modo desarrollo (con auto-reload)
npm run dev

# Modo producción
npm start
```

El servidor estará corriendo en `http://localhost:3000`

### 6. Abrir el Frontend

Puedes usar cualquier servidor local. Opciones:

**Opción A: Live Server (VS Code)**
```bash
# Abrir con Live Server extension
cd frontend/public
# Click derecho en login.html > "Open with Live Server"
```

**Opción B: Python HTTP Server**
```bash
cd frontend/public
python -m http.server 5500
```

**Opción C: Node HTTP Server**
```bash
npx http-server frontend/public -p 5500
```

Abrir en navegador: `http://localhost:5500/login.html`

## ⚙️ Configuración

### Credenciales por Defecto

El sistema incluye usuarios de prueba:

| Usuario | Contraseña | Rol |
|---------|-----------|-----|
| admin | admin123 | Administrador |
| cajero | cajero123 | Cajero |

**⚠️ IMPORTANTE:** Cambiar estas contraseñas en producción.

## 📂 Estructura del Proyecto

```
esquina-del-ahorro/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── database.js
│   │   ├── controllers/
│   │   │   ├── usuariosController.js
│   │   │   ├── productosController.js
│   │   │   ├── ventasController.js
│   │   │   └── catalogosController.js
│   │   ├── routes/
│   │   │   ├── usuarios.js
│   │   │   ├── productos.js
│   │   │   ├── ventas.js
│   │   │   └── catalogos.js
│   │   └── index.js
│   ├── .env.example
│   ├── .gitignore
│   └── package.json
│
├── frontend/
│   ├── public/
│   │   ├── login.html
│   │   └── dashboard.html
│   └── src/
│       ├── pages/
│       │   ├── login.js
│       │   └── dashboard.js
│       ├── styles/
│       │   ├── login.css
│       │   └── dashboard.css
│       └── utils/
│           ├── api.js
│           └── helpers.js
│
├── database/
│   └── schema.sql
│
└── README.md
```

## 🔌 API Endpoints

### Autenticación

```http
POST /api/usuarios/login
Content-Type: application/json

{
  "usuario": "admin",
  "password": "admin123"
}
```

### Productos

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/productos` | Listar todos los productos |
| GET | `/api/productos/:id` | Obtener un producto |
| POST | `/api/productos` | Crear producto |
| PUT | `/api/productos/:id` | Actualizar producto |
| DELETE | `/api/productos/:id` | Eliminar producto |
| GET | `/api/productos/stock-bajo` | Productos con stock bajo |
| POST | `/api/productos/:id/ajustar-stock` | Ajustar stock |

### Ventas

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/ventas` | Listar ventas |
| POST | `/api/ventas` | Crear venta |
| GET | `/api/ventas/:id` | Detalle de venta |
| PUT | `/api/ventas/:id/anular` | Anular venta |
| GET | `/api/ventas/reporte` | Reporte de ventas |
| GET | `/api/ventas/productos-mas-vendidos` | Top productos |

### Catálogos

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/catalogos/categorias` | Listar categorías |
| POST | `/api/catalogos/categorias` | Crear categoría |
| GET | `/api/catalogos/proveedores` | Listar proveedores |
| POST | `/api/catalogos/proveedores` | Crear proveedor |
| GET | `/api/catalogos/clientes` | Listar clientes |
| POST | `/api/catalogos/clientes` | Crear cliente |

## 🗄️ Esquema de Base de Datos

### Tablas Principales

- **usuarios** - Usuarios del sistema
- **roles** - Roles y permisos
- **productos** - Catálogo de productos
- **categorias** - Categorías de productos
- **proveedores** - Proveedores
- **clientes** - Base de clientes
- **ventas** - Cabecera de ventas
- **ventas_detalle** - Detalle de productos vendidos
- **compras** - Registro de compras
- **compras_detalle** - Detalle de compras
- **movimientos_inventario** - Historial de movimientos
- **caja** - Control de caja
- **movimientos_caja** - Movimientos de efectivo
- **gastos** - Registro de gastos

## 🗺️ Roadmap

### ✅ Versión 1.0 (Actual)
- [x] Sistema de autenticación
- [x] CRUD de productos
- [x] Gestión de inventario
- [x] Dashboard básico

### 🚧 Versión 1.5 (En Desarrollo)
- [ ] Sistema completo de ventas (POS)
- [ ] Impresión de tickets
- [ ] Gestión de compras
- [ ] Reportes avanzados

### 📅 Versión 2.0 (Futuro)
- [ ] Sistema de facturación electrónica
- [ ] Múltiples sucursales
- [ ] App móvil
- [ ] Integración con lectores de código de barras
- [ ] Backup automático
- [ ] Notificaciones en tiempo real

## 📝 Notas de Seguridad

⚠️ **IMPORTANTE PARA PRODUCCIÓN:**

1. **Cambiar credenciales por defecto**
2. **Usar HTTPS**
3. **Implementar JWT** para autenticación
4. **Hash de contraseñas** con bcrypt
5. **Validación de entrada** en todos los endpoints
6. **Rate limiting** para prevenir ataques

## 📄 Licencia

ISC © 2026 Esquina del Ahorro

---

Hecho con ❤️ para la gestión de pequeños negocios