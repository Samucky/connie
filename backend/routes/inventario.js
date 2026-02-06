const express = require('express');
const router = express.Router();
const { read, write, generateId } = require('../utils/storage');

const ENTITY = 'inventario';

// Listar todos los productos
router.get('/', (req, res) => {
  try {
    const productos = read(ENTITY);
    res.json(productos);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Obtener un producto por id
router.get('/:id', (req, res) => {
  try {
    const productos = read(ENTITY);
    const producto = productos.find(p => p.id === req.params.id);
    if (!producto) return res.status(404).json({ error: 'Producto no encontrado' });
    res.json(producto);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Crear producto
router.post('/', (req, res) => {
  try {
    const { nombre, precio_unitario, cantidad_disponible } = req.body;
    if (!nombre || precio_unitario == null || cantidad_disponible == null) {
      return res.status(400).json({ error: 'Faltan campos requeridos: nombre, precio_unitario, cantidad_disponible' });
    }
    const productos = read(ENTITY);
    const producto = {
      id: generateId(),
      nombre: String(nombre).trim(),
      precio_unitario: Number(precio_unitario),
      cantidad_disponible: Math.max(0, Number(cantidad_disponible)),
      fecha_registro: new Date().toISOString(),
    };
    productos.push(producto);
    write(ENTITY, productos);
    res.status(201).json(producto);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Actualizar producto
router.put('/:id', (req, res) => {
  try {
    const productos = read(ENTITY);
    const idx = productos.findIndex(p => p.id === req.params.id);
    if (idx === -1) return res.status(404).json({ error: 'Producto no encontrado' });
    const { nombre, precio_unitario, cantidad_disponible } = req.body;
    if (nombre != null) productos[idx].nombre = String(nombre).trim();
    if (precio_unitario != null) productos[idx].precio_unitario = Number(precio_unitario);
    if (cantidad_disponible != null) productos[idx].cantidad_disponible = Math.max(0, Number(cantidad_disponible));
    write(ENTITY, productos);
    res.json(productos[idx]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Eliminar producto
router.delete('/:id', (req, res) => {
  try {
    const productos = read(ENTITY);
    const filtered = productos.filter(p => p.id !== req.params.id);
    if (filtered.length === productos.length) return res.status(404).json({ error: 'Producto no encontrado' });
    write(ENTITY, filtered);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Descontar stock (uso interno / ventas)
function descontarStock(items) {
  const productos = read(ENTITY);
  for (const item of items) {
    const p = productos.find(pr => pr.id === item.id_producto);
    if (!p) throw new Error(`Producto no encontrado: ${item.id_producto}`);
    const nuevaCant = p.cantidad_disponible - (item.cantidad || 0);
    if (nuevaCant < 0) throw new Error(`Stock insuficiente para "${p.nombre}"`);
    p.cantidad_disponible = nuevaCant;
  }
  write(ENTITY, productos);
}

module.exports = { router, descontarStock };
