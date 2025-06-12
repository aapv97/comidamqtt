echo "🔧 Apagando servicios antiguos (si los hay) ..."
docker-compose down

echo "🚀 Construyendo y ejecutando ComidaMQTT..."
docker-compose up --build
