# Desplegar POS Connie en Render

## Requisitos

1. Cuenta en [Render](https://render.com) (gratis).
2. El proyecto en **GitHub** (o GitLab). Si aún no está en Git:

   ```bash
   cd c:\Users\samue\Downloads\connie
   git init
   git add .
   git commit -m "Initial commit"
   # Crea un repo en GitHub y enlázalo:
   git remote add origin https://github.com/TU-USUARIO/TU-REPO.git
   git branch -M main
   git push -u origin main
   ```

## Opción A: Con Blueprint (recomendado)

1. Entra en [dashboard.render.com](https://dashboard.render.com).
2. **New** → **Blueprint**.
3. Conecta tu cuenta de GitHub/GitLab y elige el repositorio **connie**.
4. Render detectará el archivo `render.yaml` en la raíz.
5. Revisa el servicio **connie-pos** (root: `backend`, build: `npm install`, start: `npm start`).
6. Haz clic en **Apply**.
7. Espera a que termine el deploy. La URL será algo como:  
   `https://connie-pos.onrender.com`

## Opción B: Sin Blueprint (manual)

1. Entra en [dashboard.render.com](https://dashboard.render.com).
2. **New** → **Web Service**.
3. Conecta el repositorio donde está el proyecto **connie**.
4. Configura:
   - **Name:** `connie-pos` (o el que quieras).
   - **Region:** la que prefieras (p. ej. Oregon).
   - **Branch:** `main` (o la rama que uses).
   - **Root Directory:** `backend` (importante).
   - **Runtime:** Node.
   - **Build Command:** `npm install`.
   - **Start Command:** `npm start`.
   - **Plan:** Free (o el que quieras).
5. **Create Web Service** y espera al primer deploy.

## Después del deploy

- La app quedará en una URL como:  
  `https://connie-pos.onrender.com`
- Login: **connie** / **connie321@**
- En plan **Free**, el servicio se “duerme” tras unos minutos sin visitas; la primera carga puede tardar 30–60 segundos.

## Datos en Render

- Los JSON (`inventario`, `ventas`, `deudores`, `pagos`, `usuarios`) se guardan en el sistema de archivos del contenedor.
- En cada **nuevo deploy** ese sistema de archivos se reinicia, así que los datos no son permanentes.
- Para datos persistentes en el futuro tendrías que usar una base de datos (p. ej. Render Postgres) o un disco persistente (planes de pago).

## Problemas frecuentes

- **Build falla:** Revisa que **Root Directory** sea `backend` y que en esa carpeta existan `package.json` y `server.js`.
- **404 al entrar:** Asegúrate de abrir la URL del servicio (p. ej. `https://connie-pos.onrender.com`) y no una ruta local.
- **Login no funciona:** Comprueba que el deploy haya terminado bien y que la pestaña “Logs” del servicio no muestre errores al arrancar.
