const wrapper = document.querySelector(".wrapper"),
  searchInput = wrapper.querySelector("input"),
  volume = wrapper.querySelector(".word i"),
  infoText = wrapper.querySelector(".info-text"),
  synonyms = wrapper.querySelector(".synonyms .list"),
  removeIcon = wrapper.querySelector(".search span");
let audio = null; 

function data(result, word) {
  if (result.title) {
    infoText.innerHTML = `Can't find the meaning of <span>"${word}"</span>. Please, try to search for another word.`;
  } else {
    wrapper.classList.add("active");
    let definitions = result[0].meanings[0].definitions[0],
      phoneticsList = result[0].phonetics, 
      phonetics = `${result[0].meanings[0].partOfSpeech}  /${phoneticsList[0]?.text || ''}/`;
    
    document.querySelector(".word p").innerText = result[0].word;
    document.querySelector(".word span").innerText = phonetics;
    document.querySelector(".meaning span").innerText = definitions.definition;
    document.querySelector(".example span").innerText = definitions.example || "No example available.";

    // Find a valid audio URL
    let audioUrl = "";
    for (let i = 0; i < phoneticsList.length; i++) {
      if (phoneticsList[i].audio) {
        audioUrl = phoneticsList[i].audio;
        break;
      }
    }

    // If a valid audio URL exists, create an audio object
    if (audioUrl) {
      audio = new Audio(audioUrl);
    } else {
      audio = null; // Set to null if no valid audio is found
      console.warn("No audio pronunciation found for this word.");
    }

    // Handle synonyms
    if (!definitions.synonyms || definitions.synonyms.length === 0) {
      synonyms.parentElement.style.display = "none";
    } else {
      synonyms.parentElement.style.display = "block";
      synonyms.innerHTML = "";
      for (let i = 0; i < Math.min(5, definitions.synonyms.length); i++) {
        let tag = `<span onclick="search('${definitions.synonyms[i]}')">${definitions.synonyms[i]}</span>`;
        synonyms.insertAdjacentHTML("beforeend", tag);
      }
    }
  }
}

function search(word) {
  fetchApi(word);
  searchInput.value = word;
}

function fetchApi(word) {
  wrapper.classList.remove("active");
  infoText.style.color = "#000";
  infoText.innerHTML = `Searching the meaning of <span>"${word}"</span>`;
  let url = `https://api.dictionaryapi.dev/api/v2/entries/en/${word}`;
  fetch(url)
    .then((response) => response.json())
    .then((result) => data(result, word))
    .catch(() => {
      infoText.innerHTML = `Can't find the meaning of <span>"${word}"</span>. Please, try to search for another word.`;
    });
}

searchInput.addEventListener("keyup", (e) => {
  let word = e.target.value.trim();
  if (e.key === "Enter" && word) {
    fetchApi(word);
  }
});

volume.addEventListener("click", () => {
  if (audio) {
    volume.style.color = "#4D59FB";
    audio.play().catch((err) => console.error("Error playing audio:", err));
    setTimeout(() => {
      volume.style.color = "#999";
    }, 800);
  } else {
    alert("No pronunciation available for this word.");
  }
});

removeIcon.addEventListener("click", () => {
  searchInput.value = "";
  searchInput.focus();
  wrapper.classList.remove("active");
  infoText.style.color = "#9A9A9A";
  infoText.innerHTML = "Type any existing word and press enter to get meaning, example, synonyms, etc.";
  audio = null;
});
