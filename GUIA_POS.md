# 🛒 Sistema de Punto de Venta (POS) - Guía Completa

## ✅ ¿Qué acabamos de construir?

Hemos creado un **sistema de caja registradora completo** que incluye:

1. **Búsqueda de Productos** 🔍
   - Buscar por nombre o código
   - Atajo de teclado F2 para búsqueda rápida
   - Vista en tarjetas con stock disponible

2. **Carrito de Compras** 🛒
   - Agregar productos con un click
   - Ajustar cantidades (+/-)
   - Eliminar productos del carrito
   - Validación de stock disponible

3. **Cálculos Automáticos** 💰
   - Subtotal de productos
   - IGV (18% automático)
   - Total final
   - Actualización en tiempo real

4. **Procesamiento de Ventas** ✅
   - Selección de cliente (opcional)
   - Método de pago (efectivo, tarjeta, transferencia, crédito)
   - Notas adicionales
   - Impresión de ticket

5. **Gestión de Inventario** 📦
   - Reduce stock automáticamente al vender
   - Registra movimientos de inventario
   - Previene ventas sin stock

---

## 🚀 Cómo usar el POS

### Paso 1: Acceder al Punto de Venta
1. Inicia sesión en el sistema
2. En el menú lateral, haz clic en **🛒 Punto de Venta**

### Paso 2: Agregar productos al carrito
1. **Opción A:** Haz clic en cualquier producto de la cuadrícula
2. **Opción B:** Usa la barra de búsqueda (presiona F2)
3. El producto se agregará al carrito automáticamente

### Paso 3: Ajustar cantidades
- Usa los botones **+** y **−** para cambiar cantidades
- O haz clic en el icono 🗑️ para eliminar

### Paso 4: Seleccionar cliente (opcional)
- Elige un cliente del dropdown
- O haz clic en **➕** para agregar uno nuevo

### Paso 5: Procesar la venta
1. Selecciona el método de pago
2. Agrega notas si es necesario
3. Haz clic en **✅ Procesar Venta**
4. Opcionalmente imprime el ticket

---

## 🎨 Características Visuales

### Panel Izquierdo: Productos
```
┌─────────────────────────────────┐
│  🔍 Buscar producto...          │
├─────────────────────────────────┤
│  ┌───────┐  ┌───────┐  ┌───────┐│
│  │Arroz  │  │Aceite │  │Leche  ││
│  │P001   │  │P002   │  │P003   ││
│  │Stock:50│  │Stock:30│  │Stock:40││
│  │S/ 4.80│  │S/10.50│  │S/ 4.50││
│  └───────┘  └───────┘  └───────┘│
└─────────────────────────────────┘
```

### Panel Derecho: Carrito y Total
```
┌─────────────────────────────────┐
│ Cliente: [Seleccionar...] [➕]  │
├─────────────────────────────────┤
│ Producto    │ Precio │ Cant │ Sub│
│ Arroz      │  4.80  │ [2]  │ 9.60│
│ Leche      │  4.50  │ [1]  │ 4.50│
├─────────────────────────────────┤
│ Subtotal:              S/ 14.10 │
│ IGV (18%):             S/  2.54 │
│ TOTAL:                 S/ 16.64 │
├─────────────────────────────────┤
│ Método: [Efectivo ▼]            │
│ Notas: [____________]           │
├─────────────────────────────────┤
│ [❌ Cancelar] [✅ Procesar]     │
└─────────────────────────────────┘
```

---

## 🔧 Funciones Técnicas

### Backend (Ya implementado)
```javascript
POST /api/ventas
{
  "cliente_id": 1,
  "usuario_id": 1,
  "productos": [
    {
      "producto_id": 1,
      "cantidad": 2,
      "precio_unitario": 4.80
    }
  ],
  "metodo_pago": "efectivo",
  "descuento": 0,
  "notas": "Venta de mostrador"
}
```

**El backend automáticamente:**
1. ✅ Inserta la venta en la tabla `ventas`
2. ✅ Inserta los detalles en `ventas_detalle`
3. ✅ Reduce el stock en `productos`
4. ✅ Registra el movimiento en `movimientos_inventario`
5. ✅ Calcula subtotal, IGV y total

---

## 📋 Flujo de Datos

```
┌──────────┐     ┌──────────┐     ┌──────────┐
│ Frontend │────▶│  Backend │────▶│  MySQL   │
│   POS    │     │   API    │     │    DB    │
└──────────┘     └──────────┘     └──────────┘
     │                  │                │
     │ 1. Buscar        │                │
     │    productos     │ 2. SELECT      │
     │◀─────────────────│◀───────────────│
     │                  │                │
     │ 3. Agregar       │                │
     │    al carrito    │                │
     │    (local)       │                │
     │                  │                │
     │ 4. Procesar      │                │
     │    venta         │ 5. INSERT      │
     │─────────────────▶│───────────────▶│
     │                  │    ventas      │
     │                  │ 6. UPDATE      │
     │                  │───────────────▶│
     │                  │    stock       │
     │ 7. Confirmación  │                │
     │◀─────────────────│                │
     │                  │                │
     │ 8. Recargar      │ 9. SELECT      │
     │    productos     │    (nuevo      │
     │◀─────────────────│◀────stock)─────│
     │                  │                │
```

---

## 🧪 Cómo Probar

### 1. Verifica que los servidores estén corriendo
```bash
# Backend
http://localhost:3000/health

# Frontend
http://localhost:5500/public/login.html
```

### 2. Inicia sesión
```
Usuario: admin
Contraseña: admin123
```

### 3. Ir al POS
- Haz clic en **🛒 Punto de Venta** en el menú

### 4. Realizar una venta de prueba
1. Busca "arroz" en la barra de búsqueda
2. Haz clic en el producto
3. Ajusta la cantidad a 2
4. Haz clic en **✅ Procesar Venta**
5. Verifica que aparezca el mensaje de éxito

### 5. Verificar en la base de datos
```sql
-- Ver la última venta
SELECT * FROM ventas ORDER BY id DESC LIMIT 1;

-- Ver los detalles de la venta
SELECT vd.*, p.nombre 
FROM ventas_detalle vd
INNER JOIN productos p ON vd.producto_id = p.id
WHERE vd.venta_id = (SELECT MAX(id) FROM ventas);

-- Ver el stock actualizado
SELECT nombre, stock FROM productos WHERE nombre LIKE '%arroz%';
```

---

## 🎯 Próximos Pasos (Opcional)

### Mejoras que puedes agregar:

1. **Código de barras** 📷
   - Integrar lector de códigos de barras
   - Agregar productos escaneando

2. **Descuentos** 💸
   - Agregar campo de descuento
   - Descuentos por porcentaje o monto fijo
   - Descuentos por producto

3. **Impresión mejorada** 🖨️
   - Ticket con más detalles
   - Configurar impresora térmica
   - Logo de la tienda

4. **Gestión de efectivo** 💵
   - Campo "Pago con:"
   - Calcular vuelto automático
   - Apertura/cierre de caja

5. **Productos favoritos** ⭐
   - Marcar productos más vendidos
   - Acceso rápido a favoritos

6. **Historial de ventas** 📊
   - Ver ventas del día
   - Anular ventas
   - Reimprimir tickets

7. **Cliente frecuente** 🏆
   - Guardar última compra
   - Puntos de lealtad
   - Historial de compras

---

## 📱 Atajos de Teclado

| Tecla | Acción |
|-------|--------|
| F2 | Enfocar búsqueda de productos |
| Enter | Agregar producto seleccionado |
| Esc | Cancelar venta |
| F12 | Procesar venta (opcional) |

---

## ⚠️ Validaciones Implementadas

✅ **No permite vender sin stock**
```javascript
if (producto.stock <= 0) {
  alert('Producto sin stock');
  return;
}
```

✅ **No permite cantidad mayor al stock**
```javascript
if (nuevaCantidad > item.stock_disponible) {
  alert(`Solo hay ${item.stock_disponible} unidades`);
  return;
}
```

✅ **Carrito vacío deshabilita el botón**
```javascript
if (carrito.length === 0) {
  btnProcesar.disabled = true;
  return;
}
```

✅ **Requiere usuario autenticado**
```javascript
const usuario = storage.get('usuario');
if (!usuario) {
  alert('No hay usuario autenticado');
  return;
}
```

---

## 🐛 Solución de Problemas

### Problema: No aparecen productos
**Solución:** Verifica que haya productos en la BD
```sql
SELECT * FROM productos WHERE activo = 1;
```

### Problema: Error al procesar venta
**Solución:** Revisa la consola del navegador (F12) y verifica:
- Backend corriendo en puerto 3000
- Usuario autenticado
- Productos con stock

### Problema: Stock no se actualiza
**Solución:** Verifica que el backend esté ejecutando el UPDATE
```sql
-- Ver movimientos de inventario
SELECT * FROM movimientos_inventario ORDER BY id DESC LIMIT 10;
```

---

## 📞 Cómo te puedo ayudar ahora

Ahora que tienes el POS funcionando, puedo ayudarte con:

1. **Agregar más funcionalidades**
   - ¿Quieres descuentos?
   - ¿Necesitas gestión de caja?
   - ¿Quieres reportes de ventas?

2. **Mejorar la interfaz**
   - ¿Cambiar colores?
   - ¿Agregar animaciones?
   - ¿Hacer responsive?

3. **Crear otros módulos**
   - Gestión de clientes
   - Gestión de proveedores
   - Reportes y estadísticas
   - Control de inventario

4. **Optimizar el código**
   - Refactorizar funciones
   - Agregar comentarios
   - Mejorar rendimiento

**¿Qué quieres que hagamos ahora?** 🚀
