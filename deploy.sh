#!/bin/bash

# Define la ruta a tu aplicación Next.js
# Asegúrate de que esta sea la raíz de tu proyecto Next.js
DEPLOY_PATH="/home/cloudpanel/htdocs/tudominio.com"

# Define la rama a la que se le hará pull
GIT_BRANCH="main" # O la rama que uses, ej. "master", "production"

# Archivo de log para depuración
LOG_FILE="$DEPLOY_PATH/deployment.log"

# --- Iniciar el proceso de despliegue ---
echo "$(date) - Deployment initiated." >> $LOG_FILE
echo "Navigating to $DEPLOY_PATH" >> $LOG_FILE
cd $DEPLOY_PATH || { echo "ERROR: Could not navigate to deployment path." >> $LOG_FILE; exit 1; }

echo "Pulling latest changes from Git branch: $GIT_BRANCH" >> $LOG_FILE
git pull origin $GIT_BRANCH >> $LOG_FILE 2>&1 || { echo "ERROR: Git pull failed." >> $LOG_FILE; exit 1; }

echo "Installing/updating Node.js dependencies..." >> $LOG_FILE
# Usa npm o yarn según lo que uses en tu proyecto
npm install --production >> $LOG_FILE 2>&1 || { echo "ERROR: npm install failed." >> $LOG_FILE; exit 1; }
# yarn install --production >> $LOG_FILE 2>&1 || { echo "ERROR: yarn install failed." >> $LOG_FILE; exit 1; }

echo "Running Next.js build..." >> $LOG_FILE
# npm run build por defecto
npm run build >> $LOG_FILE 2>&1 || { echo "ERROR: Next.js build failed." >> $LOG_FILE; exit 1; }
# yarn build si usas yarn
# yarn build >> $LOG_FILE 2>&1 || { echo "ERROR: Next.js build failed." >> $LOG_FILE; exit 1; }

# --- Reiniciar el proceso de Next.js ---
# Esto es crucial para que los cambios se apliquen.
# Asumo que estás usando PM2 o un sistema similar para mantener Next.js corriendo.
# Si estás usando PM2, el comando sería algo como:
echo "Restarting Next.js process (assuming PM2)..." >> $LOG_FILE
pm2 restart all >> $LOG_FILE 2>&1 || { echo "ERROR: PM2 restart failed. Ensure PM2 is running and configured." >> $LOG_FILE; exit 1; }
# O si solo reinicias una aplicación específica por nombre:
# pm2 restart your_nextjs_app_name >> $LOG_FILE 2>&1 || { echo "ERROR: PM2 restart failed." >> $LOG_FILE; exit 1; }

echo "$(date) - Deployment complete." >> $LOG_FILE