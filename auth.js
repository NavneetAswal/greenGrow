// Check auth state and redirect
auth.onAuthStateChanged((user) => {
  const currentPage = window.location.pathname.split("/").pop();

  if (user) {
    // User is logged in
    if (currentPage === "index.html" || currentPage === "register.html") {
      window.location.href = "dashboard.html";
    }
  } else {
    // User is logged out
    if (currentPage === "dashboard.html") {
      window.location.href = "index.html";
    }
  }
});

// Display error message
function showError(elementId, message) {
  const errorElement = document.getElementById(elementId);
  errorElement.textContent = message;
  errorElement.style.display = "block";
  setTimeout(() => {
    errorElement.style.display = "none";
  }, 5000);
}

// Display success message
function showSuccess(elementId, message) {
  const successElement = document.getElementById(elementId);
  successElement.textContent = message;
  successElement.style.display = "block";
  setTimeout(() => {
    successElement.style.display = "none";
  }, 5000);
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
