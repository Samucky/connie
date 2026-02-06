/**
 * Utilidad para leer y escribir archivos JSON.
 * Centraliza el acceso a los datos para facilitar migración a base de datos.
 */

const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '..', 'data');

function getFilePath(entity) {
  return path.join(DATA_DIR, `${entity}.json`);
}

/**
 * Lee un archivo JSON y devuelve el contenido parseado.
 * @param {string} entity - Nombre del archivo (sin .json): inventario, ventas, deudores, pagos
 * @returns {Array|Object} Datos del archivo
 */
function read(entity) {
  const filePath = getFilePath(entity);
  try {
    const data = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    if (err.code === 'ENOENT') return [];
    throw err;
  }
}

/**
 * Escribe datos en un archivo JSON.
 * @param {string} entity - Nombre del archivo
 * @param {Array|Object} data - Datos a escribir
 */
function write(entity, data) {
  const filePath = getFilePath(entity);
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
}

/**
 * Genera un ID único basado en timestamp y random.
 */
function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

module.exports = { read, write, getFilePath, generateId, DATA_DIR };
