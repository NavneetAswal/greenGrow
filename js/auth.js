// Auth state change handler
auth.onAuthStateChanged((user) => {
  const currentPage = window.location.pathname.split("/").pop();

  if (user) {
    // Only redirect from login/register pages
    if (currentPage === "login.html" || currentPage === "register.html") {
      window.location.href = "dashboard.html";
    }
  } else {
    // Redirect from protected pages
    const protectedPages = ["dashboard.html", "farmer.html"];
    if (protectedPages.includes(currentPage)) {
      window.location.href = "login.html";
    }
  }
});

// Update navbar based on auth state
function updateNavbar(user) {
  const navbtns = document.querySelector(".navbtns");
  if (!navbtns) return;

  if (user) {
    // User is logged in - show logout button
    const loginLink = document.getElementById("login-nav");
    const registerLink = document.getElementById("register-nav");

    if (loginLink && registerLink) {
      loginLink.style.display = "none";
      registerLink.style.display = "none";

      const logoutBtn = document.createElement("a");
      logoutBtn.href = "#";
      logoutBtn.id = "logout-btn";
      logoutBtn.textContent = `Logout (${user.displayName || user.email})`;
      logoutBtn.addEventListener("click", logout);

      navbtns.appendChild(logoutBtn);
    }
  } else {
    // User is logged out - show login/register buttons
    const loginLink = document.getElementById("login-nav");
    const registerLink = document.getElementById("register-nav");
    const logoutBtn = document.getElementById("logout-btn");

    if (loginLink && registerLink) {
      loginLink.style.display = "block";
      registerLink.style.display = "block";
    }

    if (logoutBtn) {
      logoutBtn.remove();
    }
  }
}

// Logout function
function logout() {
  auth
    .signOut()
    .then(() => {
      window.location.href = "index.html";
    })
    .catch((error) => {
      console.error("Logout error:", error);
    });
}

// Show error message
function showError(elementId, message) {
  const errorElement = document.getElementById(elementId);
  if (errorElement) {
    errorElement.textContent = message;
    errorElement.style.display = "block";
    setTimeout(() => {
      errorElement.style.display = "none";
    }, 5000);
  }
}

// Show success message
function showSuccess(elementId, message) {
  const successElement = document.getElementById(elementId);
  if (successElement) {
    successElement.textContent = message;
    successElement.style.display = "block";
    setTimeout(() => {
      successElement.style.display = "none";
    }, 5000);
  }
}
