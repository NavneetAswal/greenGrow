// Firebase authentication state handler
firebase.auth().onAuthStateChanged((user) => {
  const currentPage = window.location.pathname.split("/").pop();

  if (user) {
    // Update user data in localStorage
    const userData = {
      name: user.displayName || user.email.split("@")[0],
      email: user.email,
    };
    localStorage.setItem("currentUser", JSON.stringify(userData));

    // Redirect from auth pages
    if (["login.html", "register.html"].includes(currentPage)) {
      window.location.href = "dashboard.html";
    }
  } else {
    // Clear user data and protect routes
    localStorage.removeItem("currentUser");
    if (["dashboard.html", "farmer.html"].includes(currentPage)) {
      window.location.href = "login.html";
    }
  }

  updateNavbar(user);
});

// Navbar updater function
function updateNavbar(user) {
  const navbtns = document.querySelector(".navbtns");
  if (!navbtns) return;

  // Remove existing logout button
  const existingLogout = document.getElementById("logout-btn");
  if (existingLogout) existingLogout.remove();

  if (user) {
    // Create new logout button
    const logoutElement = document.createElement("a");
    logoutElement.href = "#";
    logoutElement.id = "logout-btn";
    logoutElement.className = "nav-button";
    logoutElement.innerHTML = "Logout";

    // Get profile link reference
    const profileLink = document.querySelector('a[href="dashboard.html"]');

    // Insert logout button after profile link
    if (profileLink) {
      profileLink.insertAdjacentElement("afterend", logoutElement);
      // Update profile text
      profileLink.textContent = user.displayName || "Profile";
    }
  }
}

// Universal logout handler
document.addEventListener("click", (e) => {
  if (e.target?.id === "logout-btn") {
    e.preventDefault();
    firebase
      .auth()
      .signOut()
      .then(() => {
        window.location.href = "index.html";
      })
      .catch((error) => {
        console.error("Logout error:", error);
        alert("Logout failed. Please try again.");
      });
  }
});
