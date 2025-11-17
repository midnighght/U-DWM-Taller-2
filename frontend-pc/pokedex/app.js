const BASE_URL = `http://localhost:5100`;

const $ = (id) => document.getElementById(id);
function setStatus(msg) { $("status").textContent = msg; }

const colorMap = {
  fire: "from-orange-400 to-red-500",
  water: "from-sky-400 to-blue-500",
  grass: "from-green-400 to-emerald-500",
  electric: "from-yellow-300 to-amber-400",
  poison: "from-fuchsia-400 to-purple-500",
  psychic: "from-pink-400 to-rose-500",
  rock: "from-stone-400 to-amber-600",
  ground: "from-yellow-400 to-amber-600",
  ice: "from-cyan-300 to-blue-300",
  flying: "from-indigo-300 to-blue-400",
  bug: "from-lime-400 to-green-500",
  normal: "from-zinc-300 to-zinc-400",
  fairy: "from-pink-300 to-fuchsia-300",
  ghost: "from-indigo-700 to-purple-700",
  fighting: "from-orange-600 to-amber-700",
  dark: "from-neutral-700 to-stone-700",
  dragon: "from-violet-500 to-indigo-600",
  steel: "from-gray-400 to-zinc-500",
  default: "from-slate-300 to-slate-400"
};

function colorForType(t) {
  return colorMap[t] || colorMap.default;
}

function renderCard(p) {
  const type = p.types[0] || "normal";
  const color = colorForType(type);
  return `
    <div class="card bg-gradient-to-br ${color} rounded-xl p-3 text-white flex flex-col items-center justify-center cursor-pointer" data-name="${p.name}">
      <img src="${p.sprite}" alt="${p.name}" class="w-20 h-20 mb-2 drop-shadow-md" />
      <h2 class="capitalize font-bold text-lg">${p.name}</h2>
      <p class="text-xs opacity-90">${p.types.join(", ")}</p>
    </div>
  `;
}

function renderGrid(list) {
  if (!list || list.length === 0) {
    $("grid").innerHTML = `<p class="col-span-full text-center text-slate-500">Sin resultados</p>`;
    return;
  }
  $("grid").innerHTML = list.map(renderCard).join("");

  // Eventos para abrir modal
  document.querySelectorAll(".card").forEach(card => {
    card.addEventListener("click", () => {
      const name = card.getAttribute("data-name");
      openModal(name);
    });
  });
}

async function fetchAll() {
  setStatus("Cargando Pokémon...");
  try {
    const res = await fetch(`${BASE_URL}/pokemon?limit=100`);
    const data = await res.json();
    renderGrid(data);
    setStatus(`Mostrando ${data.length} Pokémon (Lista demo).`);
  } catch (err) {
    console.error(err);
    setStatus("Error al obtener datos.");
  }
}

async function fetchByName() {
  const name = $("pokemonName").value.trim().toLowerCase();
  if (!name) return setStatus("Escribe un nombre.");
  setStatus("Buscando...");
  try {
    const res = await fetch(`${BASE_URL}/pokemon/${encodeURIComponent(name)}`);
    if (res.status === 404) {
      $("grid").innerHTML = "";
      setStatus("Pokémon no encontrado.");
      return;
    }
    const data = await res.json();
    renderGrid([data]);
    setStatus("Éxito.");
  } catch (err) {
    console.error(err);
    setStatus("Error al buscar Pokémon.");
  }
}

function randomName() {
  const pool = ["pikachu","bulbasaur","charmander","squirtle","jigglypuff","eevee","snorlax","meowth"];
  return pool[Math.floor(Math.random() * pool.length)];
}

// Modal
async function openModal(name) {
  try {
    const res = await fetch(`${BASE_URL}/pokemon/${encodeURIComponent(name)}`);
    const p = await res.json();
    $("modalSprite").src = p.sprite;
    $("modalName").textContent = p.name;
    $("modalTypes").textContent = `Tipo: ${p.types.join(", ")}`;
    $("modalHeight").textContent = `Altura: ${p.height ?? "?"} m`;
    $("modalWeight").textContent = `Peso: ${p.weight ?? "?"} kg`;
    $("modal").classList.remove("hidden");
    $("modal").classList.add("flex");
  } catch (err) {
    console.error(err);
  }
}

function closeModal() {
  $("modal").classList.add("hidden");
  $("modal").classList.remove("flex");
}

window.addEventListener("DOMContentLoaded", () => {
  $("btnAll").addEventListener("click", fetchAll);
  $("btnSearch").addEventListener("click", fetchByName);
  $("btnRandom").addEventListener("click", () => {
    $("pokemonName").value = randomName();
    fetchByName();
  });
  $("pokemonName").addEventListener("keydown", e => {
    if (e.key === "Enter") fetchByName();
  });
  $("closeModal").addEventListener("click", closeModal);
  $("modal").addEventListener("click", e => {
    if (e.target.id === "modal") closeModal();
  });

  fetchAll();
});
