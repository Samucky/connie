# POS Connie - Sistema de Punto de Venta

Sistema web para negocio pequeño: ventas de contado y fiado, control de inventario, deudores y pagos de deuda. Interfaz con Tailwind CSS y almacenamiento en archivos JSON (sin base de datos).

## Estructura del proyecto

```
connie/
├── backend/
│   ├── server.js           # Servidor Express, rutas y servir frontend
│   ├── package.json
│   ├── data/               # Archivos JSON (una entidad por archivo)
│   │   ├── inventario.json
│   │   ├── ventas.json
│   │   ├── deudores.json
│   │   └── pagos.json
│   ├── routes/
│   │   ├── inventario.js   # CRUD productos + descontar stock
│   │   ├── ventas.js       # Registrar venta (contado/fiado)
│   │   ├── deudores.js     # CRUD deudores + agregar/descontar deuda
│   │   └── pagos.js        # Registrar pago (descuenta deuda)
│   └── utils/
│       └── storage.js      # Lectura/escritura JSON reutilizable
├── frontend/
│   ├── index.html          # Dashboard
│   ├── ventas.html         # Registrar venta
│   ├── inventario.html     # CRUD productos
│   ├── deudores.html       # Lista y editar deudores
│   ├── pagos.html          # Registrar pago + historial
│   ├── css/
│   │   └── app.css
│   └── js/
│       └── api.js          # Cliente API reutilizable
└── README.md
```

## Cómo ejecutar

1. Instalar dependencias del backend:
   ```bash
   cd backend
   npm install
   ```

2. Iniciar el servidor:
   ```bash
   npm start
   ```

3. Abrir en el navegador: **http://localhost:3000**

El frontend se sirve desde el mismo servidor (Express `static`). Toda la API está en `/api/*`.

---

## Ejemplos de archivos JSON

### inventario.json

Cada producto:

- `id`: identificador único  
- `nombre`: nombre del producto  
- `precio_unitario`: número  
- `cantidad_disponible`: número (se descuenta al vender)  
- `fecha_registro`: ISO 8601  

```json
[
  {
    "id": "prod-1",
    "nombre": "Arroz 1kg",
    "precio_unitario": 2.50,
    "cantidad_disponible": 50,
    "fecha_registro": "2025-02-01T10:00:00.000Z"
  }
]
```

### ventas.json

Cada venta:

- `id`, `tipo_venta` ("contado" | "fiado"), `nombre_cliente`  
- `productos`: array con `id_producto`, `nombre`, `cantidad`, `precio_unitario`, `subtotal`  
- `total`, `fecha` (ISO)  

```json
[
  {
    "id": "venta-abc",
    "tipo_venta": "fiado",
    "nombre_cliente": "María López",
    "productos": [
      {
        "id_producto": "prod-1",
        "nombre": "Arroz 1kg",
        "cantidad": 2,
        "precio_unitario": 2.50,
        "subtotal": 5.00
      }
    ],
    "total": 5.00,
    "fecha": "2025-02-06T12:00:00.000Z"
  }
]
```

### deudores.json

Cada deudor:

- `id`, `nombre`  
- `total_deuda`: se actualiza con ventas fiadas y pagos  
- `historial_compras`: array de IDs de ventas fiadas  
- `fecha_ultima_compra` (ISO)  

```json
[
  {
    "id": "deudor-xyz",
    "nombre": "María López",
    "total_deuda": 15.50,
    "historial_compras": ["venta-abc", "venta-def"],
    "fecha_ultima_compra": "2025-02-06T12:00:00.000Z"
  }
]
```

### pagos.json

Cada pago:

- `id`, `id_deudor`, `nombre_deudor`  
- `monto_pagado`, `fecha` (ISO), `metodo_pago` (opcional)  

```json
[
  {
    "id": "pago-1",
    "id_deudor": "deudor-xyz",
    "nombre_deudor": "María López",
    "monto_pagado": 10.00,
    "fecha": "2025-02-06T14:00:00.000Z",
    "metodo_pago": "Efectivo"
  }
]
```

---

## Flujos del sistema

### 1. Venta de contado

1. Usuario va a **Ventas** → elige tipo **Contado**, nombre del cliente y productos con cantidades.  
2. Frontend calcula subtotales y total y envía `POST /api/ventas` con `tipo_venta: "contado"`.  
3. Backend:  
   - Valida stock para cada producto.  
   - Descuenta `cantidad_disponible` en `inventario.json` (función `descontarStock`).  
   - Guarda la venta en `ventas.json`.  
   - No crea ni modifica deudores.  
4. El inventario queda actualizado; no hay deuda.

### 2. Venta fiada

1. Usuario va a **Ventas** → elige tipo **Fiado**, nombre del cliente y productos.  
2. Frontend envía `POST /api/ventas` con `tipo_venta: "fiado"`.  
3. Backend:  
   - Valida stock y descuenta en `inventario.json` (igual que contado).  
   - Guarda la venta en `ventas.json`.  
   - Busca en `deudores.json` por nombre (insensible a mayúsculas).  
     - Si no existe: crea un nuevo deudor con `total_deuda = total de la venta`, `historial_compras = [id_venta]`, `fecha_ultima_compra = ahora`.  
     - Si existe: suma el total de la venta a `total_deuda`, agrega el `id` de la venta a `historial_compras` y actualiza `fecha_ultima_compra`.  
4. En el **Dashboard** y en **Deudores** se ve el deudor y su deuda actualizada.

### 3. Pago de deuda

1. Usuario va a **Pagos** (o desde Dashboard / Deudores el enlace “Registrar pago”).  
2. Elige deudor (solo se listan los que tienen `total_deuda > 0`), monto y opcionalmente método de pago.  
3. Frontend envía `POST /api/pagos` con `id_deudor`, `monto_pagado`, `nombre_deudor`, `metodo_pago`.  
4. Backend:  
   - Comprueba que el deudor existe y que `monto_pagado <= total_deuda` (no permite pagar más de lo debido).  
   - Guarda el pago en `pagos.json`.  
   - Resta `monto_pagado` del `total_deuda` del deudor en `deudores.json` (función `descontarDeuda`).  
5. El dashboard y la lista de deudores muestran el nuevo `total_deuda`; el historial de pagos se ve en **Pagos**.

---

## API (resumen)

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET    | /api/inventario | Listar productos |
| GET    | /api/inventario/:id | Un producto |
| POST   | /api/inventario | Crear producto |
| PUT    | /api/inventario/:id | Actualizar producto |
| DELETE | /api/inventario/:id | Eliminar producto |
| GET    | /api/ventas | Listar ventas |
| POST   | /api/ventas | Registrar venta (contado o fiado) |
| GET    | /api/deudores | Listar deudores |
| GET    | /api/deudores/:id | Un deudor |
| POST   | /api/deudores | Crear deudor |
| PUT    | /api/deudores/:id | Actualizar deudor |
| DELETE | /api/deudores/:id | Eliminar deudor |
| GET    | /api/pagos | Listar pagos |
| GET    | /api/pagos/deudor/:idDeudor | Pagos de un deudor |
| POST   | /api/pagos | Registrar pago (descuenta deuda) |

---

## Consideraciones técnicas

- **Código modular**: rutas por entidad, `storage.js` para JSON, `api.js` en el frontend.  
- **Validaciones**: stock antes de vender, campos requeridos, pago ≤ deuda.  
- **Escalabilidad**: sustituir las funciones de `storage.js` por llamadas a una base de datos mantiene la misma API y lógica de negocio en las rutas.
