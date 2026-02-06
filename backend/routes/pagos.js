const express = require('express');
const router = express.Router();
const { read, write, generateId } = require('../utils/storage');
const { descontarDeuda } = require('./deudores');

const ENTITY = 'pagos';

// Listar todos los pagos
router.get('/', (req, res) => {
  try {
    const pagos = read(ENTITY);
    res.json(pagos);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Pagos por deudor
router.get('/deudor/:idDeudor', (req, res) => {
  try {
    const pagos = read(ENTITY);
    const filtrados = pagos.filter(p => p.id_deudor === req.params.idDeudor);
    res.json(filtrados);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Registrar pago (descuenta deuda automáticamente)
router.post('/', (req, res) => {
  try {
    const { id_deudor, nombre_deudor, monto_pagado, metodo_pago } = req.body;
    if (!id_deudor || monto_pagado == null || monto_pagado <= 0) {
      return res.status(400).json({ error: 'id_deudor y monto_pagado (positivo) son requeridos' });
    }
    const deudores = read('deudores');
    const deudor = deudores.find(d => d.id === id_deudor);
    if (!deudor) return res.status(404).json({ error: 'Deudor no encontrado' });
    const monto = Number(monto_pagado);
    if (monto > deudor.total_deuda) {
      return res.status(400).json({ error: 'El monto no puede ser mayor a la deuda actual' });
    }
    const pago = {
      id: generateId(),
      id_deudor,
      nombre_deudor: nombre_deudor || deudor.nombre,
      monto_pagado: monto,
      fecha: new Date().toISOString(),
      metodo_pago: metodo_pago || null,
    };
    const pagos = read(ENTITY);
    pagos.push(pago);
    write(ENTITY, pagos);
    descontarDeuda(id_deudor, monto);
    res.status(201).json(pago);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
