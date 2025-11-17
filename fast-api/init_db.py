import sqlite3
import os
import random
from datetime import datetime

DB_PATH = "weather.db"

# Lista inicial de ciudades con rangos de temperatura típicos (aprox)
INITIAL_CITIES = [
    ("Santiago", 8, 30),      
    ("Buenos Aires", 8, 32),
    ("Valparaíso", 8, 26),
    ("Antofagasta", 14, 26),
    ("Temuco", 4, 22),
    ("Madrid", -2, 36),
    ("Barcelona", 5, 32),
    ("Lima", 16, 29),
    ("Bogotá", 8, 22),
    ("Quito", 8, 22),
    ("Nueva York", -5, 35),
    ("Los Angeles", 10, 35),
    ("Tokio", -1, 33),
    ("Sídney", 5, 35),
    ("Londres", -2, 28),
    ("París", -3, 33),
    ("Berlín", -5, 33),
    ("Ciudad de México", 5, 30),
    ("São Paulo", 10, 34),
    ("Moscú", -20, 30)
]

def random_weather_for_city(city_name, min_t, max_t):
    """Genera datos de clima realistas (simulados) para una ciudad"""
    # Usa una semilla basada en el nombre para variar por ciudad de forma consistente si se generara fuera de DB.
    seed = sum(ord(c) for c in city_name) + len(city_name)
    rnd = random.Random(seed + int(datetime.utcnow().timestamp() % 1000))
    temperature = round(rnd.uniform(min_t, max_t), 1)
    humidity = rnd.randint(30, 95)

    # Elegir descripción coherente según temperatura y humedad
    if humidity > 85:
        description = "Lluvia ligera"
    elif temperature <= 0:
        description = "Nieve / helado"
    elif temperature <= 10:
        description = "Frío y nublado"
    elif temperature <= 20:
        description = "Parcialmente nublado"
    elif temperature <= 28:
        description = "Cielo despejado"
    else:
        description = "Caluroso / soleado"

    date = datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S UTC")
    return temperature, humidity, description, date

def init_db():
    """Crea la BD y la tabla si no existen; inserta datos iniciales si la tabla está vacía"""
    db_exists = os.path.exists(DB_PATH)
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS weather_data (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            city TEXT NOT NULL UNIQUE,
            temperature REAL NOT NULL,
            humidity INTEGER NOT NULL,
            description TEXT NOT NULL,
            date TEXT NOT NULL
        )
    """)

    cursor.execute("SELECT COUNT(*) FROM weather_data")
    count = cursor.fetchone()[0]

    if count == 0:
        # Inserta datos iniciales
        rows = []
        for city, mn, mx in INITIAL_CITIES:
            temp, hum, desc, dt = random_weather_for_city(city, mn, mx)
            rows.append((city, temp, hum, desc, dt))
        cursor.executemany("""
            INSERT INTO weather_data (city, temperature, humidity, description, date)
            VALUES (?, ?, ?, ?, ?)
        """, rows)
        conn.commit()
        print(f"Base inicializada con {len(rows)} ciudades.")
    else:
        print("Base ya inicializada; no se insertaron ciudades nuevas.")

    conn.close()

def get_or_create_city(city_name):
    """Busca una ciudad por nombre (case-insensitive). Si no existe, la genera, la guarda y retorna."""
    city_name = city_name.strip()
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()

    # búsqueda case-insensitive
    cursor.execute("SELECT * FROM weather_data WHERE LOWER(city) = LOWER(?)", (city_name,))
    row = cursor.fetchone()
    if row:
        result = dict(row)
        conn.close()
        return result

    # Si no existe, generar valores "realistas" usando un rango por defecto:
    # Si la ciudad está en la lista inicial, usamos su rango; si no, usamos rango global.
    ranges = {c.lower(): (mn, mx) for c, mn, mx in INITIAL_CITIES}
    key = city_name.lower()
    if key in ranges:
        mn, mx = ranges[key]
    else:
        # Asumir rango templado/global
        mn, mx = 0, 35

    temp, hum, desc, dt = random_weather_for_city(city_name, mn, mx)
    cursor.execute("""
        INSERT INTO weather_data (city, temperature, humidity, description, date)
        VALUES (?, ?, ?, ?, ?)
    """, (city_name, temp, hum, desc, dt))
    conn.commit()
    cursor.execute("SELECT * FROM weather_data WHERE id = last_insert_rowid()")
    row = cursor.fetchone()
    conn.close()
    return dict(row)

if __name__ == "__main__":
    init_db()
