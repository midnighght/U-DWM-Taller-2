const cardPrefab = document.getElementById("card-prefab");
const cardPrefabType1 = document.getElementById("card-prefab-type1");
const cardPrefabType2 = document.getElementById("card-prefab-type2");
const pokemonSpan = document.getElementById("pokemon-span");
const cardPrefabCenterImage = document.getElementById(
  "card-prefab-center-image"
);
const genSelector = document.getElementById("gen-selector");

const cardsCointainer = document.getElementById("cards-container");
const genContainer = document.getElementById("gen-container");
const genText = document.getElementById("gen-text");
let currentRunId = 0;
let currentAbortController = null;
const delay = 0;
var loadedCards = [];
const getGenerationLengths = async () => {
  const totalGens = await getTotalGenerations();
  const lengths = [];
  for (let i = 1; i <= totalGens; i++) {
    try {
      const URL = `https://pokeapi.co/api/v2/generation/${i}/`;
      const response = await fetch(URL);
      const json = await response.json();
      lengths.push(json.pokemon_species.length);
    } catch (exception) {
      console.error(exception);
      lengths.push(0);
    }
  }
  return lengths;
};

const getTotalGenerations = async () => {
  try {
    const URL = `https://pokeapi.co/api/v2/generation/`;
    const response = await fetch(URL);
    const json = await response.json();

    console.log(json.results.length);
    return json.results.length;
  } catch (exception) {
    console.error(exception);
  }
};
const initializeGenSelector = async () => {
  let gens = await getGenerationLengths();
  for (let i = 1; i <= gens.length; i++) {
    let cloneContainer = genText.cloneNode(true);
    const anchor = cloneContainer.querySelector("a");
    anchor.textContent = `Gen ${RomanNumerals[i]}`;
    let left = gens.slice(0, i - 1).reduce((a, b) => a + b, 0) + 1;
    let right = left + gens[i - 1] - 1;
    anchor.onclick = () => addPokemons(left, right);
    genContainer.appendChild(cloneContainer);
  }

  let cloneContainer = genText.cloneNode(true);
  const anchor = cloneContainer.querySelector("a");
  anchor.textContent = "All";
  anchor.onclick = () =>
    addPokemons(
      1,
      gens.reduce((a, b) => a + b, 0)
    );
  genContainer.appendChild(cloneContainer);
  genText.style.visibility = "hidden";
};
const generationLengthById = async (id) => {
  try {
    const URL = `https://pokeapi.co/api/v2/generation/${id}/`;
    const response = await fetch(URL);
    const json = await response.json();

    console.log(json.pokemon_species.length);
  } catch (exception) {
    console.error(exception);
  }
};

const addPokemons = async (left, right) => {
  // start a new run: increment id and abort any previous run

  const runId = ++currentRunId;
  if (currentAbortController) {
    try {
      currentAbortController.abort();
    } catch (_) {}
  }
  currentAbortController = new AbortController();
  const signal = currentAbortController.signal;

  // cardPrefab.style.visibility = "visible";
  Array.from(cardsCointainer.children).forEach((child) => {
    if (child !== cardPrefab) {
      cardsCointainer.removeChild(child);
    }
  });
  loadedCards = [];
  for (let i = left; i <= right; i++) {
    const clonedCard = cardPrefab.cloneNode(true);
    clonedCard.id = "";
    //clonedCard.style.visibility = "hidden";
    cardsCointainer.appendChild(clonedCard);
    loadedCards.push(clonedCard);
  }
  const loadProccess = async () => {
    // Prepare all fetch promises in advance
    const fetchPromises = [];
    for (let i = left; i <= right; i++) {
      // If a newer run started, stop
      if (runId !== currentRunId) return;
      const request = "https://pokeapi.co/api/v2/pokemon/" + i + "/";
      fetchPromises.push(
        fetch(request, { signal })
          .then((response) => (response.ok ? response.json() : null))
          .catch((err) => {
            if (err.name === "AbortError") return null;
            console.error("Fetch error for", i, err);
            return null;
          })
      );
    }

    // Wait for all fetches to complete
    const results = await Promise.all(fetchPromises);

    // Now update cards in order
    for (let i = left; i <= right; i++) {
      if (runId !== currentRunId) return;
      const data = results[i - left];
      const cardIndex = i - left;
      const clonedCard = loadedCards[cardIndex];
      if (!clonedCard || !data) continue;

      // Decorate the cloned card (same as before)
      const clonedImage = clonedCard.querySelector("#card-prefab-center-image");
      const clonedShinyImage = clonedCard.querySelector(
        "#card-prefab-center-shiny-image"
      );
      const clonedType1 = clonedCard.querySelector("#card-prefab-type1");
      const clonedType2 = clonedCard.querySelector("#card-prefab-type2");
      const clonedName = clonedCard.querySelector("#pokemon-span");

      // requesting the pokemon image
      const imageURL = data.sprites?.front_default || "";
      const shinyImageURL = data.sprites?.front_shiny || "";

      if (clonedImage) {
        clonedImage.classList.remove(
          "opacity-100",
          "transition-opacity",
          "duration-500"
        );
        clonedImage.classList.add("opacity-0");
        clonedImage.src = imageURL;
        clonedImage.onload = () => {
          clonedImage.classList.add(
            "opacity-100",
            "transition-opacity",
            "duration-500"
          );
        };
      }

      clonedCard.onclick = () => {
        if (clonedImage.src === imageURL) {
          clonedImage.src = shinyImageURL;
          clonedCard.classList.remove("border-transparent");
          clonedCard.classList.add("border-4", "border-yellow-400");
        } else if (clonedImage.src === shinyImageURL) {
          clonedImage.src = imageURL;
          clonedCard.classList.remove("border-yellow-400");
          clonedCard.classList.add("border-4", "border-transparent");
        }
      };

      // request pokemon name
      const pokemonName = `#${i} ${data.name
        .charAt(0)
        .toUpperCase()}${data.name.slice(1)}`;
      if (clonedName) clonedName.textContent = pokemonName;

      // request pokemon type
      const pokemonType1 = data.types[0].type.name;
      const pokemonType2 =
        data.types.length > 1 ? data.types[1].type.name : null;
      if (clonedType1) {
        clonedType1.textContent = `${pokemonType1
          .charAt(0)
          .toUpperCase()}${pokemonType1.slice(1)}`;
        if (colorsType[pokemonType1]) {
          clonedType1.style.color = colorsType[pokemonType1];
        }
      }
      if (clonedType2) {
        clonedType2.textContent = pokemonType2
          ? `${pokemonType2.charAt(0).toUpperCase()}${pokemonType2.slice(1)}`
          : "";
        if (colorsType[pokemonType2]) {
          clonedType2.style.color = colorsType[pokemonType2];
        }
      }
      clonedCard.style.visibility = "visible";
    }
  };
  await loadProccess();
};
const RomanNumerals = {
  1: "I",
  2: "II",
  3: "III",
  4: "IV",
  5: "V",
  6: "VI",
  7: "VII",
  8: "VIII",
  9: "IX",
  10: "X",
};

const colorsType = {
  normal: "#A8A77A",
  fire: "#EE8130",
  water: "#6390F0",
  electric: "#F7D02C",
  grass: "#7AC74C",
  ice: "#96D9D6",
  fighting: "#C22E28",
  poison: "#A33EA1",
  ground: "#E2BF65",
  flying: "#A98FF3",
  psychic: "#F95587",
  bug: "#A6B91A",
  rock: "#B6A136",
  ghost: "#735797",
  dragon: "#6F35FC",
  dark: "#705746",
  steel: "#B7B7CE",
  fairy: "#D685AD",
};

initializeGenSelector();
