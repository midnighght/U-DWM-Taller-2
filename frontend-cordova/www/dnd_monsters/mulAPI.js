// API base URL configuration for android emulator
const host = 'https://c67rtp99-5000.brs.devtunnels.ms';
const baseUrl = `${host}/mul-api`;

const container = document.getElementById("statblock-container");
const prefab = document.getElementById("statblock-prefab");
const sentinel = document.getElementById("scroll-sentinel");
const backToTop = document.getElementById("back-to-top");
const errorContainer = document.getElementById("error-container");
const errorMessage = document.getElementById("error-message");
const retryButton = document.getElementById("retry-button");

const fallbackImg = "img/fallback_img.png";
const loadingImg = "img/loading_img.png";

let monsterIndex = 0;   // start with first monster
const batchSize = 12;   // load 10 monsters at a time
let monstersList = [];  // list of monsters (name + url)
let monstersDetails = []; // fetched detailed monsters
let showOnlyFavorites = false; // toggle state

// Show error message
function showError(message) {
  if (errorMessage) errorMessage.textContent = message;
  if (errorContainer) errorContainer.classList.remove("hidden");
  if (container) container.classList.add("hidden");
}

// Hide error message
function hideError() {
  if (errorContainer) errorContainer.classList.add("hidden");
  if (container) container.classList.remove("hidden");
}

// Utility: calculate D&D stat modifier
function getModifier(stat) {
  return Math.floor((stat - 10) / 2);
}

// Utility: capitalize first letter of string
function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// Lazy loading of Images with IntersectionObserver
const imgObserver = new IntersectionObserver((entries, obs) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const img = entry.target;
      img.src = img.dataset.src;
      img.onload = () => img.classList.add("opacity-100");
      obs.unobserve(img);
    }
  });
}, { rootMargin: "100px" });

// 1. Fetch only the monster list (minimal with favorite)
async function fetchMonsters() {
  try {
    const res = await fetch(baseUrl + "/monsters/");
    if (!res.ok) {
      throw new Error(`HTTP error! Status: ${res.status}`);
    }
    const data = await res.json();
    monstersList = Array.isArray(data) ? data : [];
    if (showOnlyFavorites) {
      monstersList = monstersList.filter(m => m.favorite);
    }
    monsterIndex = 0;
    hideError();
  } catch (error) {
    console.error('Error fetching monsters:', error);
    showError(`Failed to load monsters from API. Please check if the server is running at ${baseUrl}. Error: ${error.message}`);
    throw error;
  }
}

function clearMonsters() {
  Array.from(container.children).forEach(child => {
    if (child.id !== "statblock-prefab") {
      container.removeChild(child);
    }
  });
}

async function reloadMonsters() {
  try {
    try { sentinelObserver.unobserve(sentinel); } catch {}
    clearMonsters();
    monstersDetails = [];
    monsterIndex = 0;
    await fetchMonsters();
    await appendNextBatch();
    sentinelObserver.observe(sentinel);
  } catch (error) {
    console.error('Error reloading monsters:', error);
    // Error already shown in fetchMonsters
  }
}

// 2. Fetch the next batch of detailed monsters and render
async function appendNextBatch() {
  if (monsterIndex >= monstersList.length) return;

  const nextBatch = monstersList.slice(monsterIndex, monsterIndex + batchSize);

  try {
    // Fetch details for the batch
    const batchDetails = await Promise.all(
      nextBatch.map(async m => {
        const res = await fetch(baseUrl + m.url);
        if (!res.ok) {
          throw new Error(`HTTP error! Status: ${res.status}`);
        }
        return await res.json();
      })
    );

    monstersDetails.push(...batchDetails);
    hideError();

    // Render each monster
    batchDetails.forEach(data => {
    const clone = prefab.cloneNode(true);
    clone.id = "";
    clone.classList.remove("hidden");
    clone.style.visibility = "visible";
    
    // --- Fill prefab fields ---
    // Name
    const nameEl = clone.querySelector("h1.monster-name");
    if (nameEl) nameEl.textContent = data.name;

    // Favorite toggle
    const favBtn = clone.querySelector('.favorite-toggle');
    const setStar = (el, fav) => {
      if (!el) return;
      el.setAttribute('aria-pressed', fav ? 'true' : 'false');
      el.classList.toggle('text-yellow-400', !!fav);
      el.classList.toggle('text-midnight-400', !fav);
    };
    setStar(favBtn, !!data.favorite);
    if (favBtn) {
      favBtn.addEventListener('click', async (e) => {
        e.preventDefault();
        e.stopPropagation();
        try {
          const res = await fetch(`${baseUrl}/monsters/${encodeURIComponent(data.index)}/toggle-favorite`, { method: 'PATCH' });
          if (!res.ok) return;
          const result = await res.json();
          const nowFav = !!result.favorite;
          setStar(favBtn, nowFav);
          // If showing only favorites and it was unfavorited, remove card and future loads
          if (showOnlyFavorites && !nowFav) {
            // Remove from DOM
            clone.remove();
            // Remove from pending list
            monstersList = monstersList.filter(m => m.index !== data.index);
          }
        } catch (err) {
          console.error('Failed toggling favorite', err);
        }
      });
    }

    // Type, size, alignment
    const typeEl = clone.querySelector("h3.monster-type");
    if (typeEl) typeEl.textContent = `${capitalize(data.type)}, ${data.size}, ${data.alignment}`;


    // Main stats: AC, HP, CR
    const statBlocks = clone.querySelectorAll(".monster-main-stats .monster-stat-block");
    if (statBlocks.length === 3) {
      // AC
      let ac = data.armor_class;
      const acValueEl = statBlocks[0].querySelector(".stat-value h3") || statBlocks[0].querySelector(".stat-value");
      if (acValueEl) acValueEl.textContent = Array.isArray(ac) ? ac[0].value : ac;
      // HP
      const hpValueEl = statBlocks[1].querySelector(".stat-value h3") || statBlocks[1].querySelector(".stat-value");
      if (hpValueEl) hpValueEl.textContent = data.hit_points;
      // CR
      let cr = data.challenge_rating;
      const crMap = { 0.5: "1/2", 0.25: "1/4", 0.125: "1/8" };
      const crValueEl = statBlocks[2].querySelector(".stat-value h3") || statBlocks[2].querySelector(".stat-value");
      if (crValueEl) crValueEl.textContent = crMap[cr] || cr;
    }

    // Ability scores: STR, DEX, CON, INT, WIS, CHA
    const stats = [data.strength, data.dexterity, data.constitution, data.intelligence, data.wisdom, data.charisma];
    const abilityBlocks = clone.querySelectorAll(".monster-ability-scores .ability-score");
    abilityBlocks.forEach((block, i) => {
      const mod = getModifier(stats[i]);
      const modEl = block.querySelector(".score-mod h3") || block.querySelector(".score-mod");
      const statEl = block.querySelector(".score-stat h3") || block.querySelector(".score-stat");
      if (modEl) modEl.textContent = (mod >= 0 ? "+" : "") + mod;
      if (statEl) statEl.textContent = stats[i];
    });

    // Big image (fallback + loading images) (lazy-load with IntersectionObserver)
    const imgEl = clone.querySelector("img.lazy-img");
    if (imgEl) {
        imgEl.src = loadingImg; // show loading image first
        
        // get image from original API, if not avalaible use fallback
        imgEl.dataset.src = data.image ? "https://www.dnd5eapi.co" + data.image : fallbackImg;

        imgEl.onerror = () => { // If anything fails show to fallback (e.g. loading img fails)
          imgEl.src = fallbackImg;
        }

        imgObserver.observe(imgEl); // observe for lazy loading
    }

    // Small monster type icon
    const typeIconEl = clone.querySelector("img.type-icon");
    if (typeIconEl) {
      // file path based on monster type
      const typeImg = `img/type_${data.type}.png`;

      typeIconEl.src = typeImg;
      typeIconEl.onerror = () => { // If anything fails show to fallback (e.g. type doesn't exist)
        typeIconEl.src = fallbackImg; // fallback image
      };
    }
    
    container.appendChild(clone); // Append clone
  });

  monsterIndex += batchSize;
  if (monsterIndex >= monstersList.length) {  // All monsters loaded -> stop observing sentinel
    sentinelObserver.unobserve(sentinel);
  }
  } catch (error) {
    console.error('Error fetching monster details:', error);
    showError(`Failed to load monster details from API. Error: ${error.message}`);
  }
}

// Sentinel observer for infinite scroll
const sentinelObserver = new IntersectionObserver(entries => {
    if (entries[0].isIntersecting) appendNextBatch();
}, { rootMargin: "200px" });

window.addEventListener("scroll", () => {
  if (window.scrollY > 320) { // show after scrolling 320px
    backToTop.classList.remove("opacity-0", "pointer-events-none");
    backToTop.classList.add("opacity-100", "pointer-events-auto");
  } else {
    backToTop.classList.add("opacity-0", "pointer-events-none");
    backToTop.classList.remove("opacity-100", "pointer-events-auto");
  }
});

backToTop.addEventListener("click", () => {
  window.scrollTo({ top: 0, behavior: "smooth" });
});

// Initialize
(async function init() {
  const toggleBtn = document.getElementById('toggle-favorites');
  const updateToggleText = () => {
    if (!toggleBtn) return;
    toggleBtn.textContent = showOnlyFavorites ? 'Show all monsters' : 'Show only favorites';
  };
  if (toggleBtn) {
    toggleBtn.addEventListener('click', async () => {
      showOnlyFavorites = !showOnlyFavorites;
      updateToggleText();
      await reloadMonsters();
    });
    updateToggleText();
  }

  // Add retry button functionality
  if (retryButton) {
    retryButton.addEventListener('click', async () => {
      await reloadMonsters();
    });
  }

  await reloadMonsters();
})();

// (async function init() {
//     fetchMonsters().then(() => appendNextBatch());
//     sentinelObserver.observe(sentinel); // observe scroll sentinel
// })();

// Run
// loadMonsters().then(() => observeLazyImages());


// // 1. Fetch only the monster list
// async function fetchMonsters() {
//     const res = await fetch(baseUrl + "/monsters/");
//     const data = await res.json();
//     monstersList = Array.isArray(data) ? data : [];
//     monsterIndex = 0;
// }