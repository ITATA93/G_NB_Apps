@echo off
echo ====================================================
echo  Abriendo Chrome con DevTools para NocoBase
echo ====================================================
echo.

REM Abrir Chrome con DevTools
start chrome --auto-open-devtools-for-tabs "https://nocobase.hospitaldeovalle.cl/"

echo.
echo Chrome deberia abrirse con DevTools (F12) automaticamente.
echo.
echo Si no se abre DevTools automaticamente, presiona F12 manualmente.
echo.
echo ====================================================
echo  INSTRUCCIONES:
echo ====================================================
echo.
echo 1. Espera a que cargue NocoBase
echo 2. Ve a la pestana "Console" en DevTools
echo 3. Copia y pega los comandos del archivo:
echo    comandos-devtools.txt
echo.
pause
