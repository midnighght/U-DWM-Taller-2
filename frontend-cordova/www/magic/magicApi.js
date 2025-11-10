//constantes de sugerencias por carta
const input = document.getElementById('searchInput');
const suggestions = document.getElementById('suggestions');
let formatoActivo = null;
let nextPageUrl = null;
let ordenActivo = null;
//Fetch inicial 
async function fetchMagicData() {
  let query = "*"; // consulta base

  if (formatoActivo) {
    query += ` legal:${formatoActivo}`;
  }

  // Construir la URL con formato y orden si corresponde
  let url = `https://api.scryfall.com/cards/search?q=${encodeURIComponent(query)}`;

  // Si querés que el orden venga desde la API (por fecha, por nombre, etc.)
  if (ordenActivo === "az") {
    url += `&order=name`;
  } else if (ordenActivo === "za") {
    url += `&order=name&dir=desc`;
  }

  try {
    const response = await fetch(url);
    const data = await response.json();
    displayData(data);
  } catch (error) {
    console.error("Error al cargar cartas:", error);
  }
}

//Mostrar cartas
function displayData(data) {
    let container = document.querySelector('.card-container');
    
  // Si no existe, lo creamos una sola vez
  if (!container) {
    container = document.createElement('div');
    container.className = `card-container flex flex-wrap items-center gap-4 px-4 mx-auto max-w-5xl `;
    document.body.appendChild(container);
    
  } else {
    container.innerHTML = ""; // Limpiar contenido sin tocar layout
  }
 

    // Las cartas están en data.data
    data.data.forEach(card => {
        const cardDiv = document.createElement('div');
        cardDiv.className = `
        card group  bg-slate-800 text-white rounded shadow-md p-4 w-52
        transition-transform duration-300 delay-500 ease-in-out
        hover:scale-[1.50] hover:z-10 overflow-visible 
        `;
        const name = document.createElement('h3');
        name.textContent = card.name;
        name.className = "text-sm font-semibold mb-2";
        cardDiv.appendChild(name);

        let frontImage, backImage = null;
        let frontName = card.name;
        let backName = null;

        if (Array.isArray(card.card_faces) && card.card_faces.length > 1) {
            frontImage = card.card_faces[0].image_uris?.normal;
            backImage = card.card_faces[1].image_uris?.normal;
            frontName = card.card_faces[0].name;
            backName = card.card_faces[1].name;
            name.textContent = frontName;
        } else {
            frontImage = card.image_uris?.normal;
        }
        // Imagen de la carta (si existe)
         if (frontImage) {
            const img = document.createElement('img');
            img.src = frontImage;
            img.alt = card.name;
            img.style.width = '250px';
            cardDiv.appendChild(img);

  // Si hay reverso, agrega botón para dar vuelta
            if (backImage) {
                const frontName = card.card_faces[0].name;
                const backName = card.card_faces[1].name;

                name.textContent = frontName; // inicial

                const flipBtn = document.createElement('button');
                flipBtn.textContent = "↻ Dar vuelta";
                flipBtn.className = `
                absolute bot-2 right-2 mt-2 bg-yellow-400 text-black px-2 py-1 rounded text-sm
                opacity-0 group-hover:opacity-100 transition-opacity duration-300
                `;
                flipBtn.addEventListener('click', () => {
                const isFront = img.src === frontImage;
                img.src = isFront ? backImage : frontImage;
                name.textContent = isFront ? backName : frontName;
                });

            cardDiv.appendChild(flipBtn);
            }
        }
        container.appendChild(cardDiv);
    });

    
    
}

document.addEventListener('DOMContentLoaded', fetchMagicData);

//Menu dropdwon
function toggleDropDown(id) {
  const el = document.getElementById(id);
  el.classList.toggle("hidden");
}

// Cierra el dropdown solo si el clic fue fuera del contenedor completo
document.addEventListener("click", function (event) {
  const menuContainer = document.getElementById("menuContainer");

  if (!menuContainer.contains(event.target)) {
    document.getElementById("dropDown").classList.add("hidden");
    document.getElementById("formatos").classList.add("hidden");
  }
});


async function escogerFormato(format) {
  try {
    const url = `https://api.scryfall.com/cards/search?q=legal:${format}`;
    const response = await fetch(url);

    if(!response.ok){
      throw new Error('mala vola');
    }

    const data = await response.json();

    displayData(data);
    
  } catch (error) {
    console.error('Errororororor');
  }
   formatoActivo = format;
   actualizarFiltrosActivos();
}

//Buscar carta por nombre
async function fetchCardByName(name) {
  try {
    // Construir query correctamente
    let searchQuery = `"${name}"`;
    if (formatoActivo) {
      searchQuery += ` format:${formatoActivo}`;
    }
    searchQuery += ' order:released';
    
    const res = await fetch(`https://api.scryfall.com/cards/search?q=${encodeURIComponent(searchQuery)}`);
    const data = await res.json();

    // Verifica que data.data exista y tenga contenido
    if (Array.isArray(data.data) && data.data.length > 0) {
      const limitedData = {
        data: data.data.slice(0, 5) // solo las 5 versiones más recientes
      };
      displayData(limitedData);
    } else {
      console.warn("No se encontraron versiones múltiples de la carta.");
    }
  } catch (error) {
    console.error("Error al buscar carta:", error);
  }
}


//Ir mostrando cartas a medida de que vaya coincidiendo con lo que se escribe
input.addEventListener('input', async () => {
  
  const query = input.value.trim();
  if (query.length < 2) {
    suggestions.innerHTML = "";
    return;
  }

  try {
    const res = await fetch(`https://api.scryfall.com/cards/autocomplete?q=${encodeURIComponent(query)}`);
    const data = await res.json();

    // Mostrar sugerencias en el dropdown
    suggestions.innerHTML = "";
    data.data.forEach(name => {
      const li = document.createElement('li');
      li.textContent = name;
      li.className = "p-2 hover:bg-slate-200 cursor-pointer";
      li.addEventListener('click', () => {
        input.value = name;
        suggestions.innerHTML = "";
        fetchCardByName(name);
      });
      suggestions.appendChild(li);
    });
    
    // Mostrar cartas directamente mientras se escribe
     if (!formatoActivo) {
      // Si no hay formato activo, usar método original
      const cardPromises = data.data.map(name =>
        fetch(`https://api.scryfall.com/cards/named?fuzzy=${encodeURIComponent(name)}`)
          .then(res => res.json())
          .catch(() => null)
      );

      const cards = await Promise.all(cardPromises);
      const validCards = cards.filter(card => card && (card.image_uris || card.card_faces));
      displayData({ data: validCards });
    } else {
      // Si hay formato activo, buscar con filtro
      const cardPromises = data.data.slice(0, 5).map(async (name) => {
        try {
          const searchQuery = `"${name}" format:${formatoActivo}`;
          const res = await fetch(`https://api.scryfall.com/cards/search?q=${encodeURIComponent(searchQuery)}&unique=cards`);
          
          if (res.ok) {
            const data = await res.json();
            return data.data && data.data.length > 0 ? data.data[0] : null;
          }
          return null;
        } catch {
          return null;
        }
      });

      const cards = await Promise.all(cardPromises);
      const validCards = cards.filter(card => card && (card.image_uris || card.card_faces));
      displayData({ data: validCards });
    }

  } catch (error) {
    console.error("Error en búsqueda dinámica:", error);
  }
});

function actualizarFiltrosActivos() {
  const contenedor = document.getElementById("filtrosActivos");
  contenedor.innerHTML = "";

  let hayFiltros = false;

  if (formatoActivo) {
    hayFiltros = true;
    const filtro = document.createElement("div");
    filtro.className = "bg-yellow-400 text-black px-3 py-1 rounded-full flex items-center gap-2 text-sm";
    filtro.innerHTML = `Formato: ${formatoActivo} <span class="cursor-pointer font-bold">&times;</span>`;
    filtro.querySelector("span").addEventListener("click", () => {
      formatoActivo = null;
      actualizarFiltrosActivos();
      fetchMagicData();
    });
    contenedor.appendChild(filtro);
  }

  if (ordenActivo) {
    hayFiltros = true;
    const texto = ordenActivo === "az" ? "A → Z" : "Z → A";
    const filtro = document.createElement("div");
    filtro.className = "bg-yellow-400 text-black px-3 py-1 rounded-full flex items-center gap-2 text-sm";
    filtro.innerHTML = `Orden: ${texto} <span class="cursor-pointer font-bold">&times;</span>`;
    filtro.querySelector("span").addEventListener("click", () => {
      ordenActivo = null;
      document.getElementById("ordenAlfabetico").value = "";
      actualizarFiltrosActivos();
      fetchMagicData();
    });
    contenedor.appendChild(filtro);
  }

  if (!hayFiltros) {
    contenedor.innerHTML = `<div class="text-slate-400 italic text-sm">No hay filtros activos</div>`;
  }
}


document.getElementById("ordenAlfabetico").addEventListener("change", (e) => {
  ordenActivo = e.target.value || null;
  actualizarFiltrosActivos();
  fetchMagicData(); // o la función que renderiza según filtros
});

document.getElementById("logoInicio").addEventListener("click", () => {
  // Resetear filtros
  formatoActivo = null;
  ordenActivo = null;
  document.getElementById("ordenAlfabetico").value = "";

  // Actualizar visualización de filtros
  actualizarFiltrosActivos();

  // Recargar cartas iniciales
  fetchMagicData();
});
