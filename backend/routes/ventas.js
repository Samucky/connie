const express = require('express');
const router = express.Router();
const { read, write, generateId } = require('../utils/storage');
const { descontarStock } = require('./inventario');
const { agregarDeuda } = require('./deudores');

const ENTITY = 'ventas';
const INVENTARIO = 'inventario';

// Listar todas las ventas
router.get('/', (req, res) => {
  try {
    const ventas = read(ENTITY);
    res.json(ventas);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Obtener una venta por id
router.get('/:id', (req, res) => {
  try {
    const ventas = read(ENTITY);
    const venta = ventas.find(v => v.id === req.params.id);
    if (!venta) return res.status(404).json({ error: 'Venta no encontrada' });
    res.json(venta);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Validar stock para una lista de items
function validarStock(items) {
  const productos = read(INVENTARIO);
  for (const item of items) {
    const p = productos.find(pr => pr.id === item.id_producto);
    if (!p) throw new Error(`Producto no encontrado: ${item.id_producto}`);
    const cant = item.cantidad || 0;
    if (cant <= 0) throw new Error(`Cantidad inválida para "${p.nombre}"`);
    if (p.cantidad_disponible < cant) {
      throw new Error(`Stock insuficiente para "${p.nombre}". Disponible: ${p.cantidad_disponible}`);
    }
  }
}

// Registrar venta (contado o fiado)
router.post('/', (req, res) => {
  try {
    const { tipo_venta, nombre_cliente, productos: items } = req.body;
    if (!tipo_venta || !['contado', 'fiado'].includes(tipo_venta)) {
      return res.status(400).json({ error: 'tipo_venta debe ser "contado" o "fiado"' });
    }
    if (!nombre_cliente || !String(nombre_cliente).trim()) {
      return res.status(400).json({ error: 'nombre_cliente es requerido' });
    }
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Debe incluir al menos un producto' });
    }

    const inventario = read(INVENTARIO);
    const productosVenta = [];
    let total = 0;

    for (const item of items) {
      const prod = inventario.find(p => p.id === item.id_producto);
      if (!prod) return res.status(400).json({ error: `Producto no encontrado: ${item.id_producto}` });
      const cantidad = Math.max(1, Number(item.cantidad) || 1);
      if (prod.cantidad_disponible < cantidad) {
        return res.status(400).json({
          error: `Stock insuficiente para "${prod.nombre}". Disponible: ${prod.cantidad_disponible}`,
        });
      }
      const subtotal = cantidad * prod.precio_unitario;
      productosVenta.push({
        id_producto: prod.id,
        nombre: prod.nombre,
        cantidad,
        precio_unitario: prod.precio_unitario,
        subtotal,
      });
      total += subtotal;
    }

    validarStock(productosVenta.map(p => ({ id_producto: p.id_producto, cantidad: p.cantidad })));
    descontarStock(productosVenta.map(p => ({ id_producto: p.id_producto, cantidad: p.cantidad })));

    const venta = {
      id: generateId(),
      tipo_venta,
      nombre_cliente: String(nombre_cliente).trim(),
      productos: productosVenta,
      total,
      fecha: new Date().toISOString(),
    };

    const ventas = read(ENTITY);
    ventas.push(venta);
    write(ENTITY, ventas);

    if (tipo_venta === 'fiado') {
      agregarDeuda(venta.nombre_cliente, venta.total, venta.id);
    }

    res.status(201).json(venta);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
