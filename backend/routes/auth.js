const express = require('express');
const router = express.Router();
const { read } = require('../utils/storage');

const ENTITY = 'usuarios';

router.post('/login', (req, res) => {
  try {
    const { usuario, password } = req.body;
    if (!usuario || !password) {
      return res.status(400).json({ error: 'Usuario y contraseña son requeridos' });
    }
    const usuarios = read(ENTITY);
    const user = usuarios.find(
      (u) => String(u.usuario).toLowerCase() === String(usuario).toLowerCase() && u.password === password
    );
    if (!user) {
      return res.status(401).json({ error: 'Usuario o contraseña incorrectos' });
    }
    res.json({ ok: true, usuario: user.usuario });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
