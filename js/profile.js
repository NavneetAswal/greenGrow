document.addEventListener("DOMContentLoaded", () => {
  const auth = firebase.auth();

  // Safe data getter for localStorage
  const getLocalData = (key) => {
    try {
      return JSON.parse(localStorage.getItem(key)) || [];
    } catch (error) {
      console.error(`Error loading ${key}:`, error);
      return [];
    }
  };

  auth.onAuthStateChanged((user) => {
    if (!user) {
      window.location.href = "login.html";
      return;
    }

    // Get user data with fallbacks
    const currentUser = JSON.parse(localStorage.getItem("currentUser") || "{}");

    // Update profile header
    document.getElementById("user-name").textContent =
      currentUser.name || "Green Guardian";
    document.getElementById("user-email").textContent = currentUser.email || "";

    // Generate avatar initials
    const initials = (currentUser.name || "GG")
      .split(" ")
      .map((word) => word[0]?.toUpperCase() || "")
      .join("")
      .substring(0, 2);
    document.getElementById("user-avatar").textContent = initials;

    // Load and process data
    const trees = getLocalData("trees");
    const users = getLocalData("users");

    // Filter user's trees
    const userTrees = trees.filter(
      (tree) => tree.userName?.toLowerCase() === currentUser.name?.toLowerCase()
    );
    
    // Update statistics
    document.getElementById("tree-count").textContent = userTrees.length;
    document.getElementById("co2-reduced").textContent = `${
      userTrees.length * 22
    } kg/year`;

    // Calculate ranking
    const rankedUsers = [...users].sort(
      (a, b) => (b.treesPlanted || 0) - (a.treesPlanted || 0)
    );
    const userRank =
      rankedUsers.findIndex(
        (u) => u.name?.toLowerCase() === currentUser.name?.toLowerCase()
      ) + 1;
    document.getElementById("user-rank").textContent =
      userRank > 0 ? `#${userRank}` : "New Gardener";

    // Display trees
    const treesContainer = document.getElementById("trees-container");
    treesContainer.innerHTML =
      userTrees.length > 0
        ? userTrees
            .map(
              (tree) => `
        <div class="tree-card">
          <img src="${tree.imageUrl || "/greenGrow/images/default-tree.png"}" 
               alt="${tree.plantName || "Tree"}">
          <h3>${tree.plantName || "New Plant"}</h3>
          <p>${tree.description || "No description available."}</p>
          <small>Planted: ${
            tree.plantDate
              ? new Date(tree.plantDate).toLocaleDateString()
              : "Date unknown"
          }</small>
        </div>
      `
            )
            .join("")
        : '<p class="no-trees">Start your planting journey! 🌱</p>';
  });
});
