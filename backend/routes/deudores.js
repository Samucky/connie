const express = require('express');
const router = express.Router();
const { read, write, generateId } = require('../utils/storage');

const ENTITY = 'deudores';

// Listar todos los deudores
router.get('/', (req, res) => {
  try {
    const deudores = read(ENTITY);
    res.json(deudores);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Obtener un deudor por id
router.get('/:id', (req, res) => {
  try {
    const deudores = read(ENTITY);
    const deudor = deudores.find(d => d.id === req.params.id);
    if (!deudor) return res.status(404).json({ error: 'Deudor no encontrado' });
    res.json(deudor);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Crear deudor (también usado por ventas fiadas)
router.post('/', (req, res) => {
  try {
    const { nombre, total_deuda = 0, historial_compras = [] } = req.body;
    if (!nombre || !String(nombre).trim()) {
      return res.status(400).json({ error: 'El nombre es requerido' });
    }
    const deudores = read(ENTITY);
    const deudor = {
      id: generateId(),
      nombre: String(nombre).trim(),
      total_deuda: Number(total_deuda) || 0,
      historial_compras: Array.isArray(historial_compras) ? historial_compras : [],
      fecha_ultima_compra: new Date().toISOString(),
    };
    deudores.push(deudor);
    write(ENTITY, deudores);
    res.status(201).json(deudor);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Actualizar deudor
router.put('/:id', (req, res) => {
  try {
    const deudores = read(ENTITY);
    const idx = deudores.findIndex(d => d.id === req.params.id);
    if (idx === -1) return res.status(404).json({ error: 'Deudor no encontrado' });
    const { nombre, total_deuda, historial_compras, fecha_ultima_compra } = req.body;
    if (nombre != null) deudores[idx].nombre = String(nombre).trim();
    if (total_deuda != null) deudores[idx].total_deuda = Number(total_deuda);
    if (historial_compras != null) deudores[idx].historial_compras = historial_compras;
    if (fecha_ultima_compra != null) deudores[idx].fecha_ultima_compra = fecha_ultima_compra;
    write(ENTITY, deudores);
    res.json(deudores[idx]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Eliminar deudor
router.delete('/:id', (req, res) => {
  try {
    const deudores = read(ENTITY);
    const filtered = deudores.filter(d => d.id !== req.params.id);
    if (filtered.length === deudores.length) return res.status(404).json({ error: 'Deudor no encontrado' });
    write(ENTITY, filtered);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * Busca o crea un deudor por nombre y agrega una deuda (venta fiada).
 * Retorna el deudor actualizado.
 */
function agregarDeuda(nombreCliente, montoVenta, idVenta) {
  const deudores = read(ENTITY);
  const nombre = String(nombreCliente).trim();
  let deudor = deudores.find(d => d.nombre.toLowerCase() === nombre.toLowerCase());
  if (!deudor) {
    deudor = {
      id: generateId(),
      nombre,
      total_deuda: 0,
      historial_compras: [],
      fecha_ultima_compra: new Date().toISOString(),
    };
    deudores.push(deudor);
  }
  deudor.total_deuda = (deudor.total_deuda || 0) + Number(montoVenta);
  deudor.historial_compras = deudor.historial_compras || [];
  deudor.historial_compras.push(idVenta);
  deudor.fecha_ultima_compra = new Date().toISOString();
  write(ENTITY, deudores);
  return deudor;
}

/**
 * Descuenta el monto pagado del total_deuda del deudor.
 */
function descontarDeuda(idDeudor, montoPagado) {
  const deudores = read(ENTITY);
  const deudor = deudores.find(d => d.id === idDeudor);
  if (!deudor) throw new Error('Deudor no encontrado');
  const nuevoTotal = Math.max(0, (deudor.total_deuda || 0) - Number(montoPagado));
  deudor.total_deuda = nuevoTotal;
  write(ENTITY, deudores);
  return deudor;
}

module.exports = { router, agregarDeuda, descontarDeuda };
