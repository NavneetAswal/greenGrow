let trees = JSON.parse(localStorage.getItem("trees") || "[]");
let users = JSON.parse(localStorage.getItem("users") || "[]");

// Map Configuration
const map = L.map("map").setView([30.3165, 78.0322], 6);
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png").addTo(map);

// Tree Icon
const treeIcon = L.icon({
  iconUrl: "/greenGrow/images/tree.png",
  iconSize: [45, 45],
  iconAnchor: [22, 45],
  popupAnchor: [0, -40],
});

// Normalize helper
const normalize = (str) => str.trim().toLowerCase();

// District Dropdown
const uttarakhandDistricts = [
  { district: "Almora", lat: 29.5955, lon: 79.6656 },
  { district: "Bageshwar", lat: 30.1063, lon: 79.7477 },
  { district: "Chamoli", lat: 30.456, lon: 79.603 },
  { district: "Champawat", lat: 29.2834, lon: 80.079 },
  { district: "Dehradun", lat: 30.3165, lon: 78.0322 },
  { district: "Haridwar", lat: 29.9457, lon: 78.1642 },
  { district: "Nainital", lat: 29.3806, lon: 79.4523 },
  { district: "Pauri Garhwal", lat: 30.123, lon: 78.7435 },
  { district: "Pithoragarh", lat: 29.5863, lon: 80.2137 },
  { district: "Rudraprayag", lat: 30.3604, lon: 78.9473 },
  { district: "Tehri Garhwal", lat: 30.3165, lon: 78.4611 },
  { district: "Udham Singh Nagar", lat: 28.9962, lon: 79.3527 },
  { district: "Uttarkashi", lat: 30.7276, lon: 78.444 },
];

const dropdown = document.getElementById("district-dropdown");
uttarakhandDistricts.forEach((district) => {
  const option = document.createElement("option");
  option.value = district.district;
  option.textContent = district.district;
  dropdown.appendChild(option);
});

let districtMarkers = [];
dropdown.addEventListener("change", function () {
  districtMarkers.forEach((marker) => map.removeLayer(marker));
  const selected = uttarakhandDistricts.find((d) => d.district === this.value);
  if (selected) {
    map.setView([selected.lat, selected.lon], 13);
    const marker = L.marker([selected.lat, selected.lon])
      .addTo(map)
      .bindPopup(`<b>${selected.district}</b>`);
    districtMarkers.push(marker);
  }
});

document.getElementById("plant-tree").addEventListener("click", () => {
  document.getElementById("plant-tree").textContent = "Click map location...";
});

// Map click: prepare planting form
map.on("click", (e) => {
  const plantBtn = document.getElementById("plant-tree");
  if (!plantBtn.textContent.includes("...")) return;

  const modal = document.getElementById("upload-modal");
  const formElements = {
    name: document.getElementById("user-name"),
    plant: document.getElementById("plant-name"),
    date: document.getElementById("plant-date"),
    desc: document.getElementById("plant-description"),
    file: document.getElementById("custom-file-input"),
  };

  // Reset form
  Object.values(formElements).forEach((el) => {
    if (el.type !== "file") el.value = "";
    else el.value = null;
  });

  document
    .querySelectorAll(".error-message")
    .forEach((el) => (el.textContent = ""));

  formElements.date.value = new Date().toISOString().split("T")[0];
  modal.style.display = "flex";

  // Handle upload
  const handleUpload = () => {
    let isValid = true;

    const userName = formElements.name.value.trim();
    const normalizedName = normalize(userName);

    const plantData = {
      userName: normalizedName, // normalized for consistent match
      plantName: formElements.plant.value.trim(),
      plantDate: formElements.date.value,
      description: formElements.desc.value.trim(),
      file: formElements.file.files[0],
    };

    if (!plantData.userName) {
      document.getElementById("name-error").textContent =
        "Please enter your name";
      isValid = false;
    }
    if (!plantData.plantName) {
      document.getElementById("plant-error").textContent =
        "Please name your plant";
      isValid = false;
    }
    if (!plantData.file) {
      document.getElementById("file-error").textContent =
        "Please select a photo";
      isValid = false;
    }

    if (!isValid) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const memory = {
        lat: e.latlng.lat,
        lng: e.latlng.lng,
        imageUrl: event.target.result,
        ...plantData,
        timestamp: new Date().toISOString(),
      };

      trees.push(memory);
      localStorage.setItem("trees", JSON.stringify(trees));

      // Update user stats (normalize names)
      const userIndex = users.findIndex(
        (u) => normalize(u.name) === normalizedName
      );
      if (userIndex > -1) {
        users[userIndex].treesPlanted =
          (users[userIndex].treesPlanted || 0) + 1;
      } else {
        users.push({ name: normalizedName, treesPlanted: 1 });
      }
      localStorage.setItem("users", JSON.stringify(users));

      // Add marker
      L.marker([memory.lat, memory.lng], { icon: treeIcon })
        .bindPopup(
          `
          <div class="tree-popup">
            <img src="${memory.imageUrl}">
            <h3>${memory.plantName}</h3>
            <p>Planted by ${memory.userName}</p>
            <p class="memory-date">${new Date(
              memory.plantDate
            ).toLocaleDateString()}</p>
            ${memory.description ? `<p>${memory.description}</p>` : ""}
          </div>
        `
        )
        .addTo(map);

      modal.style.display = "none";
      plantBtn.textContent = " Plant New Tree";
      loadStats();
    };

    reader.readAsDataURL(plantData.file);
  };

  document.getElementById("upload-confirm").onclick = handleUpload;
  document.getElementById("upload-cancel").onclick = () => {
    modal.style.display = "none";
    plantBtn.textContent = " Plant New Memory";
  };
});

// Statistics System
function loadStats() {
  document.getElementById("total-trees").textContent = trees.length;
  document.getElementById("footer-trees").textContent = trees.length;
  document.getElementById("total-users").textContent = users.length;

  // CO2 Calculation (22kg per tree/year)
  document.getElementById("co2-reduced").textContent = `${(
    (trees.length * 22) /
    1000
  ).toFixed(1)} tons`;

  const topUsers = users
    .sort((a, b) => (b.treesPlanted || 0) - (a.treesPlanted || 0))
    .slice(0, 3);

  document.getElementById("top-countries").innerHTML = topUsers
    .map((user) => `<li>${user.name}: ${user.treesPlanted} trees</li>`)
    .join("");
}

// Load map and stats on page load
window.addEventListener("load", () => {
  trees.forEach((tree) => {
    L.marker([tree.lat, tree.lng], { icon: treeIcon })
      .bindPopup(
        `
        <div class="tree-popup">
          <img src="${tree.imageUrl}">
          <h3>${tree.plantName}</h3>
          <p>Planted by ${tree.userName}</p>
          <p class="memory-date">${new Date(
            tree.plantDate
          ).toLocaleDateString()}</p>
          ${tree.description ? `<p>${tree.description}</p>` : ""}
        </div>
      `
      )
      .addTo(map);
  });

  loadStats();
});
