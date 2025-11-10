const container = document.getElementById("statblock-container");
const prefab = document.getElementById("statblock-prefab");

async function loadMonsters() {
  try {
    // 1. --- Get all monsters from API ---
    const listResponse = await fetch("https://www.dnd5eapi.co/api/monsters/");
    const listData = await listResponse.json();

    // 2. --- Loop through each monster ---
    for (const monster of listData.results) {
      const detailResponse = await fetch("https://www.dnd5eapi.co" + monster.url);
      const data = await detailResponse.json();

      // 3. --- Clone statblock prefab ---
      const clone = prefab.cloneNode(true);
      clone.id = ""; // remove duplicate id
      clone.classList.remove("hidden");
      clone.style.visibility = "visible";

      // 4. --- Fill prefab fields ---

      // Name
      const nameEl = clone.querySelector("h1.text-2xl");
      if (nameEl) nameEl.textContent = data.name;

      // Type, size, alignment
      const typeEl = clone.querySelector("h3.italic");
      if (typeEl) typeEl.textContent = `${capitalize(data.type)}, ${data.size}, ${data.alignment}`;

      // Big image (fallback + loading images) (lazy-load with IntersectionObserver)
      const baseUrl = "https://www.dnd5eapi.co";
      const fallbackImg = "fallback_img.png";
      const loadingImg  = "loading_img.png";
      const imgEl = clone.querySelector("img.lazy-img");

      if (imgEl) {
        imgEl.src = loadingImg;  // show loading image first

        // imgEl.dataset.src = data.image ? baseUrl + data.image : fallbackImg;
        if (data.image) {
          imgEl.dataset.src = baseUrl + data.image; // store real image
        } else {
          imgEl.dataset.src = fallbackImg; // fallback image
        }
        // If anything fails show to fallback (e.g. loading img fails)
        imgEl.onerror = () => {   
          imgEl.src = fallbackImg;
        }
        imgEl.classList.add("lazy-img");     // mark as lazy for observer
      }

      // AC
      const acEl = clone.querySelector("div:nth-child(2) > div > h1.text-lg");
      if (acEl) acEl.textContent = Array.isArray(data.armor_class) ? data.armor_class[0].value : data.armor_class;

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

      // Append clone
      container.appendChild(clone);
    }
  } catch (err) {
    console.error("Error loading monsters:", err);
  }
}

// Utility: calculate D&D stat modifier
function getModifier(stat) {
  return Math.floor((stat - 10) / 2);
}

// Utility: capitalize first letter of string
function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// Lazy loading with IntersectionObserver
const observer = new IntersectionObserver((entries, obs) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const img = entry.target;
      img.src = img.dataset.src;  
      img.onload = () => img.classList.add("opacity-100");
      obs.unobserve(img);
    }
  });
}, { rootMargin: "100px" });

// Watch all lazy images
function observeLazyImages() {
  // After all statblocks are appended, observe the lazy images
  document.querySelectorAll("img.lazy-img").forEach(img => observer.observe(img));
}

// Run
loadMonsters().then(() => observeLazyImages());
