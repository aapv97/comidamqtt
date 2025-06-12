
# ComidaMQTT

Una aplicación de pedidos de comida en tiempo real que utiliza **MQTT** y **WebSockets** para comunicar a los comensales con la cocina. Todo el sistema está **dockerizado** y se puede ejecutar fácilmente con un solo comando.

---

## Estructura del Proyecto

```bash
comidamqtt/
├── backend/         # API REST con Node.js + MySQL
├── cocina/          # Interfaz para la cocina (React + Vite)
├── comensal/        # Interfaz para el comensal (React + Vite)
├── mqtt/            # Configuración del broker Mosquitto
├── mysql/           # Scripts de inicialización de la base de datos
├── docker-compose.yml
└── start.sh         # Script de construcción y ejecución


¿Cómo ejecutar el proyecto?
1. Clonar el repositorio

git clone https://github.com/aapv977/comidamqtt.git
cd comidamqtt

2. Dar permisos de ejecución al script

chmod +x start.sh

3. Ejecutar el proyecto completo

./start.sh


Este comando construye y levanta todos los servicios con Docker Compose:

        Backend (localhost:3001)

        Comensal (localhost:5173)

        Cocina (localhost:5174)

        MQTT broker (localhost:9002)

        MySQL (localhost:3307)


Requisitos

    Docker


Tecnologías Usadas

    MQTT con WebSockets (mosquitto)

    React + Vite para frontend

    Node.js + Express para el backend

    MySQL 5.7 como base de datos

    Docker para contenerización