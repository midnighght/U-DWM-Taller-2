# U-DWM-Taller-2

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

## 3. Probar las APIs (Sample Requests)

Verificar que las APIs respondan correctamente en:
```
http://localhost:5000/mul-api/monsters
http://localhost:5100/pokemon
http://localhost:5200/weather
```

## 4. Environment Variables

Los puertos están definidos en los archivos .env y .env.example, y en docker-compose.yml. Por defecto son 5000, 5100 y 5200.

Ademas las url base de las APIs estan configuradas al comiendo de los archivos .js de cada API. Si se desea cambiar en la version para android, se debe hacer un nuevo build con Cordova.

## 5. Instalar App en emulador

Para probar la app de android instalar "blueberryAPI-v2.apk" (en apk_builds) en un dispositivo android emulado.