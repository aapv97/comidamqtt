#!/bin/sh

# Espera hasta que MySQL esté disponible
echo "⏳ Esperando a que MySQL esté disponible..."
while ! nc -z mysql 3306; do
  sleep 1
done

echo "✅ MySQL está listo. Iniciando backend..."
exec "$@"
