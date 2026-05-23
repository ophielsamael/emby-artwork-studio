#!/bin/bash

# Este script arranca ambos mundos en paralelo dentro del mismo contenedor

echo "-----------------------------------"
echo " Iniciando Servidor Python Xnoppo  "
echo "-----------------------------------"
# IMPORTANTE: Descomenta y ajusta el nombre de tu archivo de Python principal.
# python3 main.py &

echo "-----------------------------------"
echo " Iniciando Emby Artwork Studio     "
echo "-----------------------------------"
# Arrancamos Next.js usando npm (PM2 también es válido, pero el contenedor docker se encarga de mantenerlo vivo)
npm run start
