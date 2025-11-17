# Taller 2 Desarrollo Web/Móvil

## Integrantes

- Maximo Sarno, 21.853.202-0
- Ferran Rojas, 21.642.668-1
- Martin Ubilla, 20.751.624-4
- Emily Volta, 20.718.229-K


## Tecnologías Usadas

APIs implementadas con:
- Nest.js (D&D 5e monsters)
- Express.js (Pokemon)
- Fast-api (Clima)

Bases de datos utilizadas:
- SQL Lite (fast-api)
- MongoDB (Nest.js y Express.js)


## 1. Prerequisitos

Instalar / tener:
- Docker Desktop
- Node.js (>= 18.x) + npm
- Python (>= 3.10) for FastAPI service
- Optional: Java JDK, Android Studio, y Gradle si planeas hacer tu propio Android Cordova build

## 2. APIs con Docker

Para hostear las APIs localmente con Docker Desktop.

1. Desde la raiz del repo:
```
docker-compose up -d --build
```
2. Esperar hasta que los containers estén healthy.

3. Para parar y limpiar:
```
docker compose down
```
Añade `-v` si quieres remover volumes (borrar database data):
```
docker compose down -v
```

## 3. Probar las APIs

Verificar que las APIs respondan correctamente en:
```
http://localhost:5000/mul-api/monsters
http://localhost:5100/pokemon
http://localhost:5200/weather
```

## 4. Environment Variables

Los puertos están definidos en los archivos .env y .env.example, y en docker-compose.yml. Por defecto son 5000, 5100 y 5200.

Ademas las url base de las APIs estan configuradas al comienzo de los archivos .js de cada API. Si se desea cambiar en la version para android, se debe hacer un nuevo build con Cordova.

## 5. Probar App de android con Visual Studio Code Remote - Tunnels

Para probar la App en un emulador de android se debe:
1. Añadir los puertos de cada API (5000, 5100, 5200 por defecto) a los puertos de VSC Remote - Tunnels y configurar su visibilidad como pública.

2. Copiar las direcciones generadas para cada puerto, y reemplazar el valor de "host" con estas en los siguientes archivos:
- frontend-cordova/www/dnd_monsters/mulAPI.js (puerto 5000)
- frontend-cordova/www/pokedex/app.js (puerto 5100)
- frontend-cordova/www/clima-fastapi/app.js (puerto 5200)

3. Instalar cordova en frontend-cordova/ y añadir plataforma android
```
npm install -g cordova
```
```
cordova platform add android
```

4. Crear el build con los nuevos puertos
```
cordova build android --debug
```
5. Instalar el apk generado en un dispositivo android