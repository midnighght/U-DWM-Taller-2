const container = document.getElementById("statblock-container");
const prefab = document.getElementById("statblock-prefab");
const sentinel = document.getElementById("scroll-sentinel");
const backToTop = document.getElementById("back-to-top");

const baseUrl = "https://www.dnd5eapi.co";
const fallbackImg = "img/fallback_img.png";
const loadingImg = "img/loading_img.png";

let monsterIndex = 0;   // start with first monster
const batchSize = 12;   // load 10 monsters at a time
let monstersList = [];  // list of monsters (name + url)
let monstersDetails = []; // fetched detailed monsters

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

// 1. Fetch only the monster list
async function fetchMonsters() {
    const res = await fetch(baseUrl + "/api/monsters/");
    const data = await res.json();
    monstersList = data.results;
    monsterIndex = 0;
}

// 2. Fetch the next batch of detailed monsters and render
async function appendNextBatch() {
  if (monsterIndex >= monstersList.length) return;

  const nextBatch = monstersList.slice(monsterIndex, monsterIndex + batchSize);

  // Fetch details for the batch
  const batchDetails = await Promise.all(
    nextBatch.map(async m => {
      const res = await fetch(baseUrl + m.url);
      return await res.json();
    })
  );

  monstersDetails.push(...batchDetails);

  // Render each monster
  batchDetails.forEach(data => {
    const clone = prefab.cloneNode(true);
    clone.id = "";
    clone.classList.remove("hidden");
    clone.style.visibility = "visible";
    
    // --- Fill prefab fields ---
    // Name
    const nameEl = clone.querySelector("h1.text-2xl");
    if (nameEl) nameEl.textContent = data.name;

    // Type, size, alignment
    const typeEl = clone.querySelector("h3.italic");
    if (typeEl) typeEl.textContent = `${capitalize(data.type)}, ${data.size}, ${data.alignment}`;

    // AC
    const acEl = clone.querySelector("div:nth-child(2) > div > h1.text-lg");
    if (acEl) {
      let ac = data.armor_class;
      acEl.textContent = Array.isArray(ac) ? ac[0].value : ac;
    }

    // HP
    const hpEl = clone.querySelector("div:nth-child(2) > div:nth-child(2) > h1.text-lg");
    if (hpEl) hpEl.textContent = data.hit_points;

    // CR
    const crEl = clone.querySelector("div:nth-child(2) > div:nth-child(3) > h1.text-lg");
    if (crEl) {
      let cr = data.challenge_rating;
      const crMap = { // Map decimal CR to fraction CR (prettier)
        0.5: "1/2",
        0.25: "1/4",
        0.125: "1/8"
      };
      crEl.textContent = crMap[cr] || cr; // fallback to raw number if not mapped
    }

    // Stats (STR, DEX, CON, INT, WIS, CHA)
    const stats = [data.strength, data.dexterity, data.constitution, data.intelligence, data.wisdom, data.charisma];
    const statBlocks = clone.querySelectorAll(".flex.flex-col.flex-1");
    statBlocks.forEach((block, i) => {
      const mod = getModifier(stats[i]);
      const modEl = block.querySelector("h1.text-lg");
      const statEl = block.querySelector("h3");
      if (modEl) modEl.textContent = (mod >= 0 ? "+" : "") + mod;
      if (statEl) statEl.textContent = stats[i];
    });

    // Big image (fallback + loading images) (lazy-load with IntersectionObserver)
    const imgEl = clone.querySelector("img.lazy-img");
    if (imgEl) {
        imgEl.src = loadingImg; // show loading image first
        
        // get image from API, if not avalaible use fallback
        imgEl.dataset.src = data.image ? baseUrl + data.image : fallbackImg;

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
  await fetchMonsters();     // fetch only list first
  await appendNextBatch();   // load first batch
  sentinelObserver.observe(sentinel);
})();

// (async function init() {
//     fetchMonsters().then(() => appendNextBatch());
//     sentinelObserver.observe(sentinel); // observe scroll sentinel
// })();

// Run
// loadMonsters().then(() => observeLazyImages());
