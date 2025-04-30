const uttarakhandDistricts = [
    { district: "Almora", lat: 29.5955, lon: 79.6656 },
    { district: "Bageshwar", lat: 30.1063, lon: 79.7477 },
    { district: "Chamoli", lat: 30.4560, lon: 79.6030 },
    { district: "Champawat", lat: 29.2834, lon: 80.0790 },
    { district: "Dehradun", lat: 30.3165, lon: 78.0322 },
    { district: "Haridwar", lat: 29.9457, lon: 78.1642 },
    { district: "Nainital", lat: 29.3806, lon: 79.4523 },
    { district: "Pauri Garhwal", lat: 30.1230, lon: 78.7435 },
    { district: "Pithoragarh", lat: 29.5863, lon: 80.2137 },
    { district: "Rudraprayag", lat: 30.3604, lon: 78.9473 },
    { district: "Tehri Garhwal", lat: 30.3165, lon: 78.4611 },
    { district: "Udham Singh Nagar", lat: 28.9962, lon: 79.3527 },
    { district: "Uttarkashi", lat: 30.7276, lon: 78.4440 }
  ];
  
  let map = L.map('map').setView([30.3165, 78.0322], 6);
  
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors'
  }).addTo(map);
  
  const dropdown = document.getElementById('district-dropdown');
  uttarakhandDistricts.forEach((district) => {
    const option = document.createElement('option');
    option.value = district.district;
    option.textContent = district.district;
    dropdown.appendChild(option);
  });
  
  dropdown.addEventListener('change', function () {
    const selectedDistrict = this.value;
    const districtData = uttarakhandDistricts.find(d => d.district === selectedDistrict);
    if (districtData) {
      map.setView([districtData.lat, districtData.lon], 13);
      // L.marker([districtData.lat, districtData.lon]).addTo(map)
      //   .bindPopup(`<b>${districtData.district}</b><br>Lat: ${districtData.lat}, Lon: ${districtData.lon}`)
      //   .openPopup();
    }
  });
  
  // Custom tree icon
  const treeIcon = L.icon({
    iconUrl: 'https://cdn-icons-png.flaticon.com/512/427/427735.png', // use your own icon if needed
    iconSize: [30, 30],
    iconAnchor: [15, 30],
    popupAnchor: [0, -30]
  });
  
  const plantTreeButton = document.getElementById('plant-tree');
  let isPlanting = false;
  
  plantTreeButton.addEventListener('click', () => {
    isPlanting = true;
    plantTreeButton.textContent = "Click on map to select tree location...";
    alert("Click on the map to choose where to plant a tree.");
  });
  
  // Show file input on map click and upload image
  map.on('click', function (e) {
    if (!isPlanting) return;
  
    showImageUploadPrompt(e.latlng.lat, e.latlng.lng);
  
    // Reset planting state
    plantTreeButton.textContent = "Plant a Tree";
    isPlanting = false;
  });
  
  function showImageUploadPrompt(lat, lon) {
    // Create upload overlay
    const uploadDiv = document.createElement('div');
    uploadDiv.style.position = 'fixed';
    uploadDiv.style.top = '0';
    uploadDiv.style.left = '0';
    uploadDiv.style.width = '100vw';
    uploadDiv.style.height = '100vh';
    uploadDiv.style.backgroundColor = 'rgba(0,0,0,0.8)';
    uploadDiv.style.display = 'flex';
    uploadDiv.style.flexDirection = 'column';
    uploadDiv.style.justifyContent = 'center';
    uploadDiv.style.alignItems = 'center';
    uploadDiv.style.zIndex = '1000';
  
    const label = document.createElement('label');
    label.textContent = "Upload an image of the planted tree";
    label.style.color = 'white';
    label.style.marginBottom = '10px';
  
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'image/png, image/jpeg, image/jpg';
    fileInput.style.marginBottom = '15px';
  
    const uploadBtn = document.createElement('button');
    uploadBtn.textContent = "Upload & Confirm";
    uploadBtn.style.padding = "10px 20px";
    uploadBtn.style.border = "none";
    uploadBtn.style.borderRadius = "8px";
    uploadBtn.style.cursor = "pointer";
    uploadBtn.style.fontWeight = "bold";
    uploadBtn.style.backgroundColor = "#00c853";
    uploadBtn.style.color = "white";
  
    uploadBtn.addEventListener('click', () => {
      const file = fileInput.files[0];
  
      if (!file) {
        alert("Please select an image file.");
        return;
      }
  
      const fileName = file.name.toLowerCase();
      const isValidImage =
        ['image/jpeg', 'image/jpg', 'image/png'].includes(file.type) &&
        /\.(png|jpe?g)$/.test(fileName);
  
      if (!isValidImage) {
        alert("Only PNG, JPG, or JPEG images are allowed.");
        return;
      }
  
      // Add tree marker
      L.marker([lat, lon], { icon: treeIcon }).addTo(map)
        .bindPopup("🎉 Tree planted successfully!")
        .openPopup();
  
      document.body.removeChild(uploadDiv);
    });
  
    uploadDiv.appendChild(label);
    uploadDiv.appendChild(fileInput);
    uploadDiv.appendChild(uploadBtn);
    document.body.appendChild(uploadDiv);
  }
  