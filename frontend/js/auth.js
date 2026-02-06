/**
 * Comprueba si hay sesión. Si no, redirige a login.
 */
function requireAuth() {
  if (!sessionStorage.getItem('loggedIn')) {
    location.href = 'login.html';
    return false;
  }
  return true;
}

/**
 * Devuelve "Buenos días", "Buenas tardes" o "Buenas noches" según la hora.
 */
function getSaludo() {
  const h = new Date().getHours();
  if (h >= 5 && h < 12) return 'Buenos días';
  if (h >= 12 && h < 19) return 'Buenas tardes';
  return 'Buenas noches';
}

function cerrarSesion() {
  sessionStorage.removeItem('loggedIn');
  sessionStorage.removeItem('usuario');
  location.href = 'login.html';
}
