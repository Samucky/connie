const express = require('express');
const cors = require('cors');
const path = require('path');
const { router: inventarioRouter, descontarStock } = require('./routes/inventario');
const { router: deudoresRouter, agregarDeuda, descontarDeuda } = require('./routes/deudores');
const ventasRouter = require('./routes/ventas');
const pagosRouter = require('./routes/pagos');
const authRouter = require('./routes/auth');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Servir frontend estático
app.use(express.static(path.join(__dirname, '..', 'frontend')));

// API
app.use('/api/inventario', inventarioRouter);
app.use('/api/ventas', ventasRouter);
app.use('/api/deudores', deudoresRouter);
app.use('/api/pagos', pagosRouter);
app.use('/api/auth', authRouter);

// Ruta /login para que no dé 404 si alguien escribe solo /login
app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'frontend', 'login.html'));
});

// Dashboard / raíz (index comprueba sesión en el cliente y redirige a login si no hay)
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'frontend', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Servidor POS en http://localhost:${PORT}`);
});
