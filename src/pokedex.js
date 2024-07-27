function makePill(pokemonType) {
  const pillEl = document.createElement("span");
  pillEl.classList.add("pill");
  pillEl.classList.add(pokemonType.toLowerCase());
  pillEl.innerText = pokemonType;
  return pillEl;
}

function createElement(tag, options) {
  const element = document.createElement(tag);
  if (options) {
    if (options.text) {
      element.innerText = options.text;
    }
    if (options.classList) {
      if(Array.isArray(options.classList)){
        for(const classItem of options.classList){
          element.classList.add(classItem);
        }
      } else {
        element.classList.add(options.classList);
      }
    }
    if (options.src) {
      element.setAttribute("src", options.src);
    }
    if (options.alt) {
      element.setAttribute("alt", options.alt);
    }
    if (options.styles) {
      let styles = "";

      for (const style in options.styles) {
        styles += `${style}:${options.styles[style]};`;
      }

      element.setAttribute("style", styles);
    }
  }
  return element;
}

function makeCard(pokemon) {
  const cardElement = document.createElement("div");
  cardElement.classList.add("card");

  const spriteElement = document.createElement("img");
  spriteElement.classList.add("sprite");
  spriteElement.setAttribute("src", pokemon.sprites.other.home.front_default);
  spriteElement.setAttribute("alt", pokemon.name);

  const cardTitleEl = document.createElement("h2");
  cardTitleEl.innerText = pokemon.name;

  const pillsEl = document.createElement("p");
  pillsEl.classList.add("pills");

  for (const pokemonType of pokemon.types) {
    const pill = makePill(pokemonType.type.name);
    pillsEl.appendChild(pill);
  }

  cardElement.appendChild(spriteElement);
  cardElement.appendChild(cardTitleEl);
  cardElement.appendChild(pillsEl);


  cardElement.addEventListener('click', () => {
    showPokemonDetails(pokemon)
  })

  return cardElement;
}

async function getPokemon(url) {
  const response = await fetch(url);
  return response.json();
}

async function getPokemonList() {
  const response = await fetch("https://pokeapi.co/api/v2/pokemon?limit=100");
  const page = await response.json();
  const list = page.results;

  const pokemons = await Promise.all(
    list.map(async function (row) {
      return getPokemon(row.url);
    })
  );

  const cards = pokemons.map(makeCard);

  for (const card of cards) {
    document.getElementById("output").appendChild(card);
  }
}

function makeMoveTable(pokemon) {
  const moves = pokemon.moves
    .map((move) => {
      const fireRedVersion = move.version_group_details.find((version) => {
        return version.version_group.name === "firered-leafgreen";
      });
      if (!fireRedVersion) {
        return;
      }
      if (fireRedVersion.level_learned_at === 0) {
        return;
      }
      return {
        name: move.move.name,
        level: fireRedVersion.level_learned_at,
      };
    })
    .filter((a) => a)
    .sort((moveA, moveB) => {
      return moveA.level - moveB.level;
    });

  const infoMoveMoves = moves.map((move) => {
    const moveLevel = createElement("td", { text: move.level });
    const moveName = createElement("td", { text: move.name });

    const moveLine = createElement("tr");
    moveLine.appendChild(moveLevel);
    moveLine.appendChild(moveName);
    return moveLine;
  });

  const infoMovelThLevel = createElement("th", { text: "Lvl" });
  const infoMovelThMove = createElement("th", { text: "Move" });

  const infoMovelTr = createElement("tr");
  infoMovelTr.appendChild(infoMovelThLevel);
  infoMovelTr.appendChild(infoMovelThMove);

  const infoMovelThead = createElement("thead");
  infoMovelThead.appendChild(infoMovelTr);

  const infoMovelTbody = createElement("tbody");
  for (const infoMoveMove of infoMoveMoves) {
    infoMovelTbody.appendChild(infoMoveMove);
  }

  const infoMoveTable = createElement("table");

  infoMoveTable.appendChild(infoMovelThead);
  infoMoveTable.appendChild(infoMovelTbody);

  return infoMoveTable;
}

function makeInfoMoves(pokemon) {
  const moveTable = makeMoveTable(pokemon);

  const infoMoveTitle = createElement("h3", {
    text: "Moves",
    classList: "info-title",
  });

  const infoMoves = createElement("div", { classList: ["info", "info-moves"] });
  infoMoves.appendChild(infoMoveTitle);
  infoMoves.appendChild(moveTable);
  return infoMoves;
}

function makeStatsTable(pokemon) {
  const statsLines = pokemon.stats.map((stat) => {
    const statName = createElement("td", { text: stat.stat.name });
    const statValue = createElement("td", { text: stat.base_stat });

    const statBarFill = createElement("div", {
      classList: "stats-bar-fill",
      styles: { width: `${stat.base_stat}%` },
    });

    const statBar = createElement("div", { classList: "stats-bar" });
    statBar.appendChild(statBarFill);

    const statBarTd = createElement("td", { classList: "stats-bar-td" });
    statBarTd.appendChild(statBar);

    const moveLine = createElement("tr");
    moveLine.appendChild(statName);
    moveLine.appendChild(statValue);
    moveLine.appendChild(statBarTd);
    return moveLine;
  });

  const tbody = createElement("tbody");
  for (const statsLine of statsLines) {
    tbody.appendChild(statsLine);
  }

  const table = createElement("table");

  table.appendChild(tbody);

  return table;
}

function makeInfoStats(pokemon) {
  const moveTable = makeStatsTable(pokemon);

  const title = createElement("h3", {
    text: "Base stats",
    classList: "info-title",
  });

  const container = createElement("div", { classList: ["info", "info-stats"] });
  container.appendChild(title);
  container.appendChild(moveTable);
  return container;
}

function showPokemonDetails(pokemon) {
  const infoMoves = makeInfoMoves(pokemon);
  const infoStats = makeInfoStats(pokemon);

  const infoGroup = createElement("div", { classList: "info-group" });
  infoGroup.appendChild(infoMoves);
  infoGroup.appendChild(infoStats);

  const name = createElement("h2", { text: pokemon.name });

  const img = createElement("img", {
    src: pokemon.sprites.other.home.front_default,
    alt: pokemon.name,
  });

  const imgBox = createElement("div", { classList: "poke-img" });
  imgBox.appendChild(img);

  const backButton = createElement("button");
  backButton.innerText = 'Voltar'

  const actions = createElement("div", { classList: "modal-actions" });
  actions.appendChild(backButton);

  const card = createElement("div", { classList: "modal-card" });
  card.appendChild(actions);
  card.appendChild(imgBox);
  card.appendChild(name);
  card.appendChild(infoGroup);

  const modal = createElement("div", { classList: "modal" });

  modal.appendChild(card);

  setTimeout(()=> {
    card.classList.add('active')
    modal.classList.add('active')
  }, 50)

  backButton.addEventListener("click", function () {

    card.classList.remove('active')
    modal.classList.remove('active')

    setTimeout(()=> {
      document.getElementById("portal").innerHTML = "";
    }, 500)
  });

  document.getElementById("portal").appendChild(modal);
}

getPokemonList();