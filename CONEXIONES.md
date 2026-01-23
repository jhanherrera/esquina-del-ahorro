# 📋 Guía de Conexiones - Esquina del Ahorro

## 🌐 URLs del Proyecto

### Frontend
- **URL:** http://localhost:5500/public/login.html
- **Dashboard:** http://localhost:5500/public/dashboard.html
- **Servidor:** Python HTTP Server (puerto 5500)

### Backend API
- **URL Base:** http://localhost:3000
- **Documentación:** http://localhost:3000
- **Health Check:** http://localhost:3000/health

---

## 🔐 Credenciales de Usuario

### Administrador
- **Usuario:** `admin`
- **Contraseña:** `admin123`
- **Rol:** Administrador (Acceso completo)

### Cajero
- **Usuario:** `cajero`
- **Contraseña:** `cajero123`
- **Rol:** Cajero (Ventas y productos)

---

## 🗄️ Conexión a MySQL

### Datos de Conexión
```
Host: localhost
Puerto: 3306
Usuario: root
Contraseña: (vacía)
Base de Datos: supermercado
```

### Comando para conectar desde terminal
```bash
/usr/bin/mysql -u root supermercado
```

### Comando para exportar la BD
```bash
/usr/bin/mysqldump -u root supermercado > backup.sql
```

---

## 📮 Colección Postman

### 1. **Login** 🔑
```
POST http://localhost:3000/api/usuarios/login
Content-Type: application/json

Body (raw JSON):
{
  "usuario": "admin",
  "password": "admin123"
}
```

**Respuesta esperada:**
```json
{
  "success": true,
  "message": "Login exitoso",
  "user": {
    "id": 1,
    "usuario": "admin",
    "nombre_completo": "Administrador del Sistema",
    "email": "admin@esquinadelahorro.com",
    "rol": "Administrador"
  }
}
```

---

### 2. **Obtener Categorías** 📦
```
GET http://localhost:3000/api/catalogos/categorias
```

**Respuesta esperada:**
```json
[
  {
    "id": 1,
    "nombre": "Abarrotes",
    "descripcion": "Productos de despensa y alimentos básicos",
    "activo": 1,
    "created_at": "2026-01-23T18:54:32.000Z"
  },
  ...
]
```

---

### 3. **Obtener Proveedores** 🏢
```
GET http://localhost:3000/api/catalogos/proveedores
```

---

### 4. **Obtener Clientes** 👥
```
GET http://localhost:3000/api/catalogos/clientes
```

---

### 5. **Crear Categoría** ➕
```
POST http://localhost:3000/api/catalogos/categorias
Content-Type: application/json

Body (raw JSON):
{
  "nombre": "Electrónicos",
  "descripcion": "Dispositivos electrónicos y accesorios"
}
```

---

### 6. **Crear Proveedor** ➕
```
POST http://localhost:3000/api/catalogos/proveedores
Content-Type: application/json

Body (raw JSON):
{
  "nombre": "Distribuidora Lima SAC",
  "ruc_nit": "20123456789",
  "direccion": "Av. Arequipa 1234",
  "telefono": "987654321",
  "email": "contacto@distlima.com",
  "contacto_nombre": "Juan Pérez"
}
```

---

### 7. **Crear Cliente** ➕
```
POST http://localhost:3000/api/catalogos/clientes
Content-Type: application/json

Body (raw JSON):
{
  "nombre": "María García",
  "documento": "12345678",
  "tipo_documento": "DNI",
  "telefono": "987654321",
  "email": "maria@email.com",
  "direccion": "Jr. Los Olivos 456"
}
```

---

### 8. **Obtener Productos** 📦
```
GET http://localhost:3000/api/productos
```

**Respuesta esperada:**
```json
[
  {
    "id": 1,
    "codigo": "PROD001",
    "nombre": "Arroz Costeño 1kg",
    "descripcion": "Arroz superior",
    "categoria_id": 1,
    "categoria": "Abarrotes",
    "proveedor_id": 1,
    "proveedor": "Distribuidora ABC",
    "precio_compra": 3.50,
    "precio_venta": 4.50,
    "stock": 100,
    "stock_minimo": 10,
    "unidad_medida": "unidad",
    "activo": 1
  }
]
```

---

### 9. **Crear Producto** ➕
```
POST http://localhost:3000/api/productos
Content-Type: application/json

Body (raw JSON):
{
  "codigo": "PROD001",
  "nombre": "Arroz Costeño 1kg",
  "descripcion": "Arroz superior de grano largo",
  "categoria_id": 1,
  "proveedor_id": 1,
  "precio_compra": 3.50,
  "precio_venta": 4.50,
  "stock": 100,
  "stock_minimo": 10,
  "unidad_medida": "unidad"
}
```

---

### 10. **Actualizar Producto** ✏️
```
PUT http://localhost:3000/api/productos/1
Content-Type: application/json

Body (raw JSON):
{
  "codigo": "PROD001",
  "nombre": "Arroz Costeño 1kg",
  "descripcion": "Arroz superior de grano largo",
  "categoria_id": 1,
  "proveedor_id": 1,
  "precio_compra": 3.50,
  "precio_venta": 5.00,
  "stock": 150,
  "stock_minimo": 15,
  "unidad_medida": "unidad"
}
```

---

### 11. **Eliminar Producto** 🗑️
```
DELETE http://localhost:3000/api/productos/1
```

---

### 12. **Productos con Stock Bajo** ⚠️
```
GET http://localhost:3000/api/productos/stock-bajo
```

---

### 13. **Ajustar Stock** 📊
```
POST http://localhost:3000/api/productos/1/ajustar-stock
Content-Type: application/json

Body (raw JSON):
{
  "tipo": "entrada",
  "cantidad": 50,
  "motivo": "Compra a proveedor",
  "usuario_id": 1
}
```

---

### 14. **Crear Venta** 💰
```
POST http://localhost:3000/api/ventas
Content-Type: application/json

Body (raw JSON):
{
  "cliente_id": 1,
  "usuario_id": 1,
  "productos": [
    {
      "producto_id": 1,
      "cantidad": 2,
      "precio_unitario": 4.50
    },
    {
      "producto_id": 2,
      "cantidad": 1,
      "precio_unitario": 3.00
    }
  ],
  "metodo_pago": "efectivo",
  "descuento": 0,
  "notas": "Venta al contado"
}
```

**Respuesta esperada:**
```json
{
  "success": true,
  "message": "Venta registrada exitosamente",
  "venta_id": 1,
  "numero_venta": "V-1737652800000",
  "total": 13.86
}
```

---

### 15. **Obtener Ventas** 📋
```
GET http://localhost:3000/api/ventas
```

Con filtros:
```
GET http://localhost:3000/api/ventas?fecha_inicio=2026-01-01&fecha_fin=2026-01-31
```

---

### 16. **Detalle de Venta** 📄
```
GET http://localhost:3000/api/ventas/1
```

---

### 17. **Anular Venta** ❌
```
PUT http://localhost:3000/api/ventas/1/anular
```

---

### 18. **Reporte de Ventas** 📊
```
GET http://localhost:3000/api/ventas/reporte?fecha_inicio=2026-01-01&fecha_fin=2026-01-31
```

---

### 19. **Productos Más Vendidos** 🏆
```
GET http://localhost:3000/api/ventas/productos-mas-vendidos
```

---

### 20. **Obtener Usuarios** 👤
```
GET http://localhost:3000/api/usuarios
```

---

### 21. **Crear Usuario** ➕
```
POST http://localhost:3000/api/usuarios
Content-Type: application/json

Body (raw JSON):
{
  "usuario": "vendedor1",
  "password": "pass123",
  "nombre_completo": "Carlos Rodríguez",
  "email": "carlos@email.com",
  "telefono": "987654321",
  "rol_id": 2
}
```

---

### 22. **Actualizar Usuario** ✏️
```
PUT http://localhost:3000/api/usuarios/1
Content-Type: application/json

Body (raw JSON):
{
  "usuario": "admin",
  "nombre_completo": "Administrador Principal",
  "email": "admin@esquinadelahorro.com",
  "telefono": "999888777",
  "rol_id": 1,
  "activo": 1
}
```

---

### 23. **Eliminar Usuario** 🗑️
```
DELETE http://localhost:3000/api/usuarios/1
```

---

## 🚀 Comandos para Iniciar el Proyecto

### Iniciar Backend
```bash
cd /home/lenovo/Escritorio/Backend\ -\ marked/esquina-del-ahorro/backend
npm run dev
```

### Iniciar Frontend
```bash
cd /home/lenovo/Escritorio/Backend\ -\ marked/esquina-del-ahorro/frontend
python3 -m http.server 5500
```

---

## 📊 Consultas SQL Útiles

### Ver todas las tablas
```sql
USE supermercado;
SHOW TABLES;
```

### Ver usuarios
```sql
SELECT u.*, r.nombre as rol FROM usuarios u 
INNER JOIN roles r ON u.rol_id = r.id;
```

### Ver productos con categoría y proveedor
```sql
SELECT p.*, c.nombre as categoria, pr.nombre as proveedor 
FROM productos p
LEFT JOIN categorias c ON p.categoria_id = c.id
LEFT JOIN proveedores pr ON p.proveedor_id = pr.id
WHERE p.activo = 1;
```

### Ver ventas del día
```sql
SELECT v.*, c.nombre as cliente, u.nombre_completo as vendedor
FROM ventas v
LEFT JOIN clientes c ON v.cliente_id = c.id
INNER JOIN usuarios u ON v.usuario_id = u.id
WHERE DATE(v.fecha) = CURDATE()
ORDER BY v.fecha DESC;
```

### Ver productos con stock bajo
```sql
SELECT * FROM productos 
WHERE stock <= stock_minimo AND activo = 1;
```

---

## 🔧 Variables de Entorno (.env)

```env
# CONFIGURACIÓN DEL SERVIDOR
PORT=3000
NODE_ENV=development

# CONFIGURACIÓN DE LA BASE DE DATOS
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=supermercado
DB_PORT=3306

# CONFIGURACIÓN DE CORS
CORS_ORIGIN=http://localhost:5500
```

---

## ✅ Checklist de Verificación

- [x] MySQL corriendo en puerto 3306
- [x] Base de datos 'supermercado' creada
- [x] Backend corriendo en puerto 3000
- [x] Frontend corriendo en puerto 5500
- [x] Datos de prueba cargados
- [x] Rutas corregidas en HTML

---

## 📝 Notas Importantes

1. **CORS:** El backend está configurado para aceptar peticiones desde `http://localhost:5500`
2. **Sin Autenticación JWT:** Actualmente no hay tokens, el login solo valida credenciales
3. **Stock Automático:** Al crear una venta, el stock se reduce automáticamente
4. **Ventas Anuladas:** Al anular una venta, el stock se devuelve
5. **Soft Delete:** Los productos se desactivan (activo=0) en lugar de eliminarse

---

¡Listo para probar! 🚀
