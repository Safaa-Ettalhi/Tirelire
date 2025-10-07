@echo off
echo Démarrage de MongoDB...
echo.

REM Créer le répertoire de données s'il n'existe pas
if not exist "C:\data\db" (
    echo Création du répertoire de données...
    mkdir "C:\data\db"
)

REM Démarrer MongoDB
echo Démarrage du serveur MongoDB...
"C:\Program Files\MongoDB\Server\8.2\bin\mongod.exe" --dbpath "C:\data\db"

pause
