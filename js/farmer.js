const form = document.getElementById("form");
const toolSection = document.querySelector(".tool");
const resultSection = document.querySelector(".result");
const loadingSection = document.querySelector(".loading");
const backBtn = document.getElementById("backBtn");

const cropNameDisplay = document.getElementById("cropName");
const cityNameDisplay = document.getElementById("cityName");
const bestTimeDisplay = document.querySelector(".bestTime");
const weatherList = document.getElementById("weatherList");
const cropSuggestionList = document.getElementById("cropSuggestion");
const soilDetails = document.getElementById("soilDetails");

const API_KEY = "3eb7b84eb0de9115a467ecbbb48dfb85";

const cropSeasons = {
  wheat: { season: "October to December", temp: "cool" },
  rice: { season: "June to July", temp: "warm" },
  maize: { season: "June to July", temp: "warm" },
  sugarcane: { season: "October to November", temp: "moderate" },
  potato: { season: "October to November", temp: "cool" },
  tomato: { season: "December to February", temp: "warm" },
  onion: { season: "November to December", temp: "cool" },
  barley: { season: "October to November", temp: "cool" },
  cotton: { season: "May to June", temp: "hot" },
  soybean: { season: "June to July", temp: "warm" },
  pulses: { season: "October to November", temp: "moderate" },
};

const weatherIcons = {
  Clear: "images/sun.png",
  Clouds: "images/cloud.png",
  Rain: "images/heavy-rain.png",
  Thunderstorm: "images/storm.png",
  Snow: "images/snow.png",
  Mist: "images/mist.png",
  Haze: "images/mist.png",
};

const cropSuggestions = {
  hot: ["Tomato", "Maize", "Rice", "Cotton", "Soybean"],
  cold: ["Wheat", "Potato", "Onion", "Barley", "Peas"],
  moderate: ["Sugarcane", "Vegetables", "Pulses", "Oilseeds"],
};

form.addEventListener("submit", handleFormSubmit);
backBtn.addEventListener("click", resetForm);

async function handleFormSubmit(e) {
  e.preventDefault();

  const crop = document.getElementById("Crop").value.trim().toLowerCase();
  const city = document.getElementById("City").value.trim();

  if (!crop || !city) {
    showAlert("Please enter both Crop Name and City Name!");
    return;
  }

  showLoading();

  try {
    const geoData = await getCoordinates(city);
    if (!geoData.length) {
      showAlert("City not found! Please check the city name.");
      hideLoading();
      return;
    }

    const { lat, lon } = geoData[0];
    const weatherData = await getWeatherData(lat, lon);
    const soilData = await getSoilData(lat, lon);

    displayResults(crop, city, weatherData, soilData);
  } catch (error) {
    console.error("Error:", error);
    showAlert("Something went wrong. Please try again later.");
    resetForm();
  } finally {
    hideLoading();
  }
}

async function getCoordinates(city) {
  const response = await fetch(
    `https://api.openweathermap.org/geo/1.0/direct?q=${city}&limit=1&appid=${API_KEY}`
  );
  return await response.json();
}

async function getWeatherData(lat, lon) {
  const response = await fetch(
    `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}`
  );
  return await response.json();
}

async function getSoilData(lat, lon) {
  const vars = ["phh2o", "ocd", "clay"];
  const results = {};

  for (const variable of vars) {
    try {
      const res = await fetch(
        `https://api.openlandmap.org/query?lon=${lon}&lat=${lat}&var=${variable}`
      );
      const data = await res.json();
      results[variable] =
        data.value !== undefined ? data.value.toFixed(2) : "N/A";
    } catch (err) {
      console.error(`Error fetching ${variable}:`, err);
      results[variable] = "N/A";
    }
  }

  return {
    pH: results["phh2o"],
    ocd: results["ocd"],
    texture: `${results["clay"]}% clay`,
  };
}

function displayResults(crop, city, weatherData, soilData) {
  toolSection.classList.add("hidden");
  resultSection.classList.remove("hidden");

  cropNameDisplay.textContent = `Crop: ${capitalize(crop)}`;
  cityNameDisplay.textContent = `Location: ${capitalize(city)}`;
  document
    .querySelectorAll(".cityName")
    .forEach((el) => (el.textContent = capitalize(city)));

  if (cropSeasons[crop]) {
    bestTimeDisplay.textContent = `Best planting time: ${cropSeasons[crop].season}`;
  } else {
    bestTimeDisplay.textContent = `Planting information not available for ${capitalize(
      crop
    )}.`;
  }

  const todayTemp = weatherData.list[0].main.temp;
  document.getElementById(
    "currentTemp"
  ).textContent = `Current Temperature: ${todayTemp.toFixed(1)}°C`;

  displayWeatherForecast(weatherData);
  displayCropSuggestions(weatherData);
  displaySoilData(soilData);
  displayRecommendations(soilData);
}

function displayWeatherForecast(weatherData) {
  const dailyData = {};
  weatherData.list.forEach((item) => {
    const date = item.dt_txt.split(" ")[0];
    if (!dailyData[date]) {
      dailyData[date] = {
        temps: [],
        condition: item.weather[0].main,
      };
    }
    dailyData[date].temps.push(item.main.temp);
  });

  weatherList.innerHTML = "";

  Object.keys(dailyData)
    .slice(0, 5)
    .forEach((date) => {
      const { temps, condition } = dailyData[date];
      const avgTemp = temps.reduce((sum, temp) => sum + temp, 0) / temps.length;
      const iconSrc = weatherIcons[condition] || weatherIcons["Clear"];

      const li = document.createElement("li");
      li.innerHTML = `
      <div class="weather-day">
        <img src="${iconSrc}" alt="${condition}" class="weather-icon">
        <span class="weather-date">${new Date(date).toLocaleDateString(
          "en-US",
          { weekday: "short", month: "short", day: "numeric" }
        )}</span>
      </div>
      <span class="weather-temp">Avg: ${avgTemp.toFixed(
        1
      )}°C (${condition})</span>
    `;
      weatherList.appendChild(li);
    });
}

function displayCropSuggestions(weatherData) {
  const dates = Object.keys(
    weatherData.list.reduce((acc, item) => {
      const date = item.dt_txt.split(" ")[0];
      acc[date] = true;
      return acc;
    }, {})
  ).slice(0, 5);

  const avgTempOverall =
    dates.reduce((sum, date) => {
      const dayTemps = weatherData.list
        .filter((item) => item.dt_txt.startsWith(date))
        .map((item) => item.main.temp);
      return sum + dayTemps.reduce((s, t) => s + t, 0) / dayTemps.length;
    }, 0) / dates.length;

  let suggestedCrops = [];
  if (avgTempOverall >= 30) {
    suggestedCrops = cropSuggestions.hot;
  } else if (avgTempOverall <= 20) {
    suggestedCrops = cropSuggestions.cold;
  } else {
    suggestedCrops = cropSuggestions.moderate;
  }

  cropSuggestionList.innerHTML = "";
  suggestedCrops.forEach((crop) => {
    const li = document.createElement("li");
    li.textContent = crop;
    cropSuggestionList.appendChild(li);
  });
}

function displaySoilData(soilData) {
  soilDetails.innerHTML = `
    <li>Soil pH (topsoil): ${soilData.pH}</li>
    <li>Organic Carbon: ${soilData.ocd} g/kg</li>
    <li>Texture: ${soilData.texture}</li>
  `;
}

function showLoading() {
  toolSection.classList.add("hidden");
  resultSection.classList.add("hidden");
  loadingSection.classList.remove("hidden");
}

function hideLoading() {
  loadingSection.classList.add("hidden");
}

function resetForm() {
  resultSection.classList.add("hidden");
  toolSection.classList.remove("hidden");
  form.reset();
}

function showAlert(message, type = "error") {
  const alertBox = document.createElement("div");
  alertBox.className = `alert ${type}`;
  alertBox.textContent = message;
  document.body.appendChild(alertBox);
  alertBox.classList.add("alertbox");

  setTimeout(() => {
    alertBox.remove();
  }, 1000);
}

function capitalize(str) {
  return str
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function displayRecommendations(soilData) {
  const adviceList = document.getElementById("adviceList");
  const pH = parseFloat(soilData.pH);
  const oc = parseFloat(soilData.ocd);
  const clay = parseFloat(soilData.texture.split("%")[0]);
  const advice = [];

  // Fertilizer suggestions
  if (!isNaN(pH)) {
    if (pH < 5.5) {
      advice.push(
        "Soil is acidic. Add lime and avoid ammonium-based fertilizers."
      );
    } else if (pH <= 7.5) {
      advice.push("Soil pH is ideal. Use balanced NPK or organic compost.");
    } else {
      advice.push("Soil is alkaline. Use sulfur or gypsum-based fertilizers.");
    }
  }

  if (!isNaN(oc)) {
    if (oc < 0.5) {
      advice.push("Organic carbon is low. Apply compost or green manure.");
    } else {
      advice.push("Organic carbon is adequate. Maintain with organic inputs.");
    }
  }

  // Crop suggestions
  if (!isNaN(clay)) {
    if (clay < 20) {
      advice.push(
        "Soil texture is sandy. Grow crops like groundnut, carrot, watermelon."
      );
    } else if (clay <= 35) {
      advice.push(
        "Soil texture is loamy. Suitable for wheat, maize, tomato, onion."
      );
    } else {
      advice.push(
        "Soil texture is clayey. Ideal for paddy, cotton, and soybean."
      );
    }
  }

  adviceList.innerHTML = "";
  advice.forEach((tip) => {
    const li = document.createElement("li");
    li.textContent = tip;
    adviceList.appendChild(li);
  });
}
