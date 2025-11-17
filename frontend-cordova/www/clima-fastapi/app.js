// API base URL configuration for android emulator
const host = 'https://c67rtp99-5200.brs.devtunnels.ms/';
const BASE_URL = `${host}`;

const $ = id => document.getElementById(id);

function setStatus(s) { $("status").textContent = s; }

function emojiForDescription(desc) {
  const d = desc.toLowerCase();
  if (d.includes("lluv") || d.includes("rain")) return "🌧️";
  if (d.includes("nieve") || d.includes("snow")) return "❄️";
  if (d.includes("nublado") || d.includes("cloud")) return "☁️";
  if (d.includes("despejado") || d.includes("clear") || d.includes("solead")) return "🌤️";
  if (d.includes("caluroso")) return "🔥";
  return "🌈";
}

function colorForTemp(temp) {
  if (temp <= 0) return ["from-blue-800","to-blue-600","text-white"];
  if (temp <= 10) return ["from-blue-400","to-sky-400","text-white"];
  if (temp <= 20) return ["from-sky-300","to-emerald-200","text-slate-800"];
  if (temp <= 28) return ["from-yellow-200","to-amber-300","text-slate-800"];
  return ["from-amber-400","to-red-400","text-white"];
}

function renderWeatherCard(data) {
  const emoji = emojiForDescription(data.description);
  const [from, to, textColor] = colorForTemp(data.temperature);
  return `
    <div class="rounded-xl p-4 mb-3 bg-gradient-to-r ${from} ${to} ${textColor}">
      <div class="flex items-center justify-between">
        <div>
          <div class="text-sm opacity-90">${data.city}</div>
          <div class="temp-large font-extrabold">${data.temperature}°C <span class="text-xl">${emoji}</span></div>
          <div class="text-sm opacity-80">${data.description} • Humedad ${data.humidity}%</div>
        </div>
        <div class="text-xs opacity-80">${data.date.split(" ")[0]}</div>
      </div>
    </div>
  `;
}

function renderAll(list) {
  if (!list || !list.length) {
    $("result").innerHTML = "<p class='text-sm text-slate-500'>Sin datos</p>";
    return;
  }
  $("result").innerHTML = list.map(renderWeatherCard).join("");
}

async function fetchCity() {
  const city = $("city").value.trim();
  if (!city) return setStatus("Escribe una ciudad.");
  setStatus("Cargando...");
  try {
    const res = await fetch(`${BASE_URL}weather/${encodeURIComponent(city)}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    $("result").innerHTML = renderWeatherCard(data);
    setStatus("Listo");
  } catch (err) {
    console.error(err);
    setStatus("Error al conectarse. Revisa la URL o CORS.");
  }
}

async function fetchAll() {
  setStatus("Cargando todos los datos...");
  try {
    const res = await fetch(`${BASE_URL}weather`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const list = await res.json();
    renderAll(list);
    setStatus(`Mostrando ${list.length} ciudades`);
  } catch (err) {
    console.error(err);
    setStatus("Error al obtener lista.");
  }
}

function getRandomCityFromList() {
  const cities = [
    "Santiago","Buenos Aires","Valparaíso","Antofagasta","Temuco","Madrid","Barcelona",
    "Lima","Bogotá","Quito","Nueva York","Los Angeles","Tokio","Sídney","Londres",
    "París","Berlín","Ciudad de México","São Paulo","Moscú"
  ];
  return cities[Math.floor(Math.random()*cities.length)];
}

window.addEventListener("DOMContentLoaded", () => {
  $("btnFetch").addEventListener("click", fetchCity);
  $("btnAll").addEventListener("click", fetchAll);
  $("btnRandom").addEventListener("click", () => {
    $("city").value = getRandomCityFromList();
    fetchCity();
  });
  $("city").addEventListener("keydown", e => {
    if (e.key === "Enter") fetchCity();
  });

  // Mostrar todas las ciudades al cargar
  fetchAll();
});
