# fast-api/main.py
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from typing import List
import sqlite3
from init_db import init_db, get_or_create_city

# Inicializa DB al arrancar
init_db()

app = FastAPI(title="Weather API - FastAPI (Taller)")

# Habilitar CORS para desarrollo (ajusta en producción)
app.add_middleware(
    CORSMiddleware,
    # Allow all origins for development; with credentials disabled this is valid
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

def get_conn():
    conn = sqlite3.connect("weather.db", check_same_thread=False)
    conn.row_factory = sqlite3.Row
    return conn

@app.get("/", tags=["root"])
def read_root():
    return {"message": "Weather API - FastAPI (taller) - endpoints: /weather, /weather/{city}"}

@app.get("/weather", response_model=List[dict])
def list_weather():
    conn = get_conn()
    rows = conn.execute("SELECT * FROM weather_data ORDER BY city COLLATE NOCASE").fetchall()
    conn.close()
    return [dict(r) for r in rows]

@app.get("/weather/{city}", response_model=dict)
def get_weather(city: str):
    # get_or_create_city garantiza persistencia si no existía
    row = get_or_create_city(city)
    if not row:
        raise HTTPException(status_code=404, detail="City not found")
    return row
