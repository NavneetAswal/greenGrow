// Common utility functions
function showAlert(message, type = "error") {
  const alertBox = document.createElement("div");
  alertBox.className = `alert ${type}`;
  alertBox.textContent = message;
  document.body.appendChild(alertBox);
  alertBox.classList.add("alertbox");

  setTimeout(() => {
    alertBox.remove();
  }, 3000);
}

function capitalize(str) {
  return str
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}
