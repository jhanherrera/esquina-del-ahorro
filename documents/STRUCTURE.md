# 🏗️ Estructura Completa del Proyecto

```
esquina-del-ahorro/
│
├── 📁 backend/                          # Servidor Node.js + Express
│   ├── 📁 src/
│   │   ├── 📁 config/
│   │   │   └── 📄 database.js          # ✅ Conexión MySQL con dotenv
│   │   │
│   │   ├── 📁 controllers/              # ✅ Lógica de negocio
│   │   │   ├── 📄 usuariosController.js    # Login, CRUD usuarios
│   │   │   ├── 📄 productosController.js   # CRUD productos + stock
│   │   │   ├── 📄 ventasController.js      # Ventas + reportes
│   │   │   └── 📄 catalogosController.js   # Categorías, proveedores, clientes
│   │   │
│   │   ├── 📁 routes/                   # ✅ Rutas API organizadas
│   │   │   ├── 📄 usuarios.js              # /api/usuarios/*
│   │   │   ├── 📄 productos.js             # /api/productos/*
│   │   │   ├── 📄 ventas.js                # /api/ventas/*
│   │   │   └── 📄 catalogos.js             # /api/catalogos/*
│   │   │
│   │   └── 📄 index.js                  # ✅ Servidor principal (Express)
│   │
│   ├── 📄 .env                          # ✅ Variables de entorno (NO SUBIR A GIT)
│   ├── 📄 .env.example                  # ✅ Ejemplo de configuración
│   ├── 📄 .gitignore                    # ✅ Archivos a ignorar
│   └── 📄 package.json                  # ✅ Dependencias + scripts
│
├── 📁 frontend/                         # Cliente web
│   ├── 📁 public/                       # Archivos HTML estáticos
│   │   ├── 📄 login.html               # ✅ Página de login
│   │   └── 📄 dashboard.html           # ✅ Dashboard principal
│   │
│   └── 📁 src/
│       ├── 📁 pages/                    # Lógica por página
│       │   ├── 📄 login.js             # ✅ JS del login
│       │   └── 📄 dashboard.js         # ✅ JS del dashboard
│       │
│       ├── 📁 styles/                   # Estilos CSS
│       │   ├── 📄 login.css            # ✅ Estilos login
│       │   └── 📄 dashboard.css        # ✅ Estilos dashboard
│       │
│       └── 📁 utils/                    # Utilidades reutilizables
│           ├── 📄 api.js               # ✅ Funciones de API (fetch)
│           └── 📄 helpers.js           # ✅ Storage, formato, etc.
│
├── 📁 database/                         # Scripts de base de datos
│   └── 📄 schema.sql                   # ✅ Esquema completo (14 tablas)
│
├── 📁 supermercado/                     # ⚠️ Código antiguo (mantener como referencia)
│   ├── 📄 data.js                      # Antigua config (no usar)
│   ├── 📄 index.js                     # Antiguo servidor (no usar)
│   ├── 📁 backend/                     # Antiguo backend (no usar)
│   └── 📁 frontend/                    # Antiguo frontend (no usar)
│
├── 📄 README.md                         # ✅ Documentación completa
├── 📄 QUICKSTART.md                     # ✅ Guía rápida de inicio
├── 📄 MIGRATION.md                      # ✅ Guía de migración
└── 📄 STRUCTURE.md                      # ✅ Este archivo
```

---

## 📊 Resumen de Archivos Clave

### 🔥 ARCHIVOS MÁS IMPORTANTES (USAR ESTOS)

| Archivo | Ubicación | Propósito |
|---------|-----------|-----------|
| 📄 **index.js** | `backend/src/index.js` | Servidor principal del backend |
| 📄 **database.js** | `backend/src/config/database.js` | Conexión a MySQL |
| 📄 **schema.sql** | `database/schema.sql` | Esquema completo de BD |
| 📄 **.env** | `backend/.env` | Variables de entorno |
| 📄 **package.json** | `backend/package.json` | Dependencias del backend |
| 📄 **login.html** | `frontend/public/login.html` | Página de login |
| 📄 **dashboard.html** | `frontend/public/dashboard.html` | Dashboard principal |
| 📄 **README.md** | `README.md` | Documentación completa |

### ⚠️ ARCHIVOS ANTIGUOS (NO USAR - SOLO REFERENCIA)

| Archivo | Ubicación | Estado |
|---------|-----------|--------|
| ❌ data.js | `supermercado/data.js` | Obsoleto |
| ❌ index.js | `supermercado/index.js` | Obsoleto |
| ❌ Backend antiguo | `supermercado/backend/` | Obsoleto |
| ❌ Frontend antiguo | `supermercado/frontend/` | Obsoleto |

---

## 🎯 Flujo de la Aplicación

### 1️⃣ BACKEND (Puerto 3000)

```
Cliente → Express Router → Controller → Database → Response
```

**Ejemplo:**
```
GET /api/productos
  ↓
routes/productos.js → obtenerProductos()
  ↓
productosController.js → db.query("SELECT...")
  ↓
MySQL → Resultado
  ↓
JSON Response → Cliente
```

### 2️⃣ FRONTEND (Puerto 5500)

```
Usuario → HTML → JavaScript → Fetch API → Backend → Renderizar
```

**Ejemplo:**
```
Login →
  login.html →
    login.js →
      api.login() →
        POST /api/usuarios/login →
          Backend valida →
            ✅ Redirige a dashboard.html
```

---

## 📦 Dependencias del Proyecto

### Backend (Node.js)

```json
{
  "dependencies": {
    "cors": "^2.8.5",          // Control de acceso CORS
    "dotenv": "^16.4.5",       // Variables de entorno
    "express": "^4.18.2",      // Framework web
    "mysql2": "^3.6.5"         // Driver MySQL
  },
  "devDependencies": {
    "nodemon": "^3.0.2"        // Auto-reload en desarrollo
  }
}
```

### Frontend (Vanilla JS)

- ✅ Sin dependencias externas
- ✅ JavaScript nativo (ES6+)
- ✅ CSS puro
- ✅ Fetch API nativa

---

## 🗄️ Estructura de Base de Datos

### Módulos de Tablas

```
📊 USUARIOS Y SEGURIDAD
├── roles (3 roles predefinidos)
└── usuarios (admin, cajero, etc.)

📦 INVENTARIO
├── categorias (Abarrotes, Bebidas, etc.)
├── proveedores (Distribuidores)
├── productos (Catálogo completo)
└── movimientos_inventario (Historial)

💰 VENTAS
├── clientes (Base de datos)
├── ventas (Cabecera)
└── ventas_detalle (Items vendidos)

🛒 COMPRAS
├── compras (Cabecera)
└── compras_detalle (Items comprados)

💵 CONTABILIDAD
├── caja (Apertura/Cierre)
├── movimientos_caja (Ingresos/Egresos)
└── gastos (Registro de gastos)
```

---

## 🚀 Scripts Disponibles

### Backend

```bash
# Desarrollo (con auto-reload)
npm run dev

# Producción
npm start

# Instalar dependencias
npm install
```

### Base de Datos

```bash
# Crear base de datos
mysql -u root -p < database/schema.sql

# Backup
mysqldump -u root -p supermercado > backup.sql

# Restaurar
mysql -u root -p supermercado < backup.sql
```

---

## 🌐 URLs del Sistema

| Servicio | URL | Puerto |
|----------|-----|--------|
| Backend API | `http://localhost:3000` | 3000 |
| Frontend | `http://localhost:5500` | 5500 |
| MySQL | `localhost` | 3306 |

### Endpoints Principales

```
✅ Health Check
GET http://localhost:3000/health

✅ Login
POST http://localhost:3000/api/usuarios/login

✅ Productos
GET http://localhost:3000/api/productos

✅ Ventas
GET http://localhost:3000/api/ventas

✅ Reportes
GET http://localhost:3000/api/ventas/reporte
```

---

## 📈 Estadísticas del Proyecto

```
📊 BACKEND
- Controladores: 4
- Rutas: 4
- Endpoints: 20+
- Líneas de código: ~1000

📊 FRONTEND
- Páginas HTML: 2
- Módulos JS: 4
- Archivos CSS: 2
- Líneas de código: ~500

📊 BASE DE DATOS
- Tablas: 14
- Relaciones: 15+
- Índices: 6
- Datos iniciales: 50+ registros
```

---

## 🎨 Componentes UI

```
LOGIN PAGE
├── Header con logo
├── Formulario de login
│   ├── Input usuario
│   ├── Input password
│   └── Botón entrar
└── Mensaje de error/éxito

DASHBOARD
├── Navbar superior
│   ├── Logo
│   ├── Usuario actual
│   └── Botón cerrar sesión
│
├── Sidebar (menú)
│   ├── Dashboard
│   ├── Productos
│   ├── Ventas
│   ├── Inventario
│   ├── Reportes
│   └── Configuración
│
└── Content (área principal)
    ├── Dashboard (estadísticas)
    ├── Productos (CRUD)
    ├── Ventas (en desarrollo)
    ├── Inventario (en desarrollo)
    ├── Reportes (en desarrollo)
    └── Configuración (en desarrollo)
```

---

## 🔐 Seguridad Implementada

- ✅ Variables de entorno (.env)
- ✅ .gitignore configurado
- ✅ CORS configurado
- ✅ Validación de datos en backend
- ✅ Prepared statements en SQL
- ✅ Separación de credenciales

### 🚧 Pendiente (Recomendado)

- [ ] Hash de contraseñas (bcrypt)
- [ ] JWT para tokens
- [ ] Rate limiting
- [ ] HTTPS en producción
- [ ] Sanitización adicional

---

## ✅ Checklist de Desarrollo

### Completado ✅

- [x] Estructura de carpetas profesional
- [x] Arquitectura MVC
- [x] Base de datos completa (14 tablas)
- [x] CRUD de productos
- [x] CRUD de usuarios
- [x] Login funcional
- [x] Dashboard con estadísticas
- [x] API REST organizada
- [x] Frontend modular
- [x] Documentación completa

### En Progreso 🚧

- [ ] Sistema de ventas completo
- [ ] Gestión de compras
- [ ] Control de caja
- [ ] Reportes avanzados

### Futuro 📅

- [ ] Facturación electrónica
- [ ] App móvil
- [ ] Múltiples sucursales
- [ ] Backup automático

---

## 💡 Tips de Uso

### Para Desarrollo

1. Siempre trabajar en la carpeta **backend/** y **frontend/**
2. NO modificar la carpeta **supermercado/** (es código antiguo)
3. Usar **nodemon** para auto-reload del backend
4. Verificar la consola del navegador (F12) para errores

### Para Producción

1. Cambiar `NODE_ENV=production` en .env
2. Usar contraseñas seguras
3. Implementar HTTPS
4. Configurar CORS correctamente
5. Hacer backups regulares de la BD

---

## 📞 Soporte

- 📖 Ver [README.md](README.md) - Documentación completa
- 🚀 Ver [QUICKSTART.md](QUICKSTART.md) - Guía rápida
- 🔄 Ver [MIGRATION.md](MIGRATION.md) - Guía de migración
- 🐛 Reportar issues en GitHub

---

**¡Sistema listo para desarrollo y producción!** 🎉
