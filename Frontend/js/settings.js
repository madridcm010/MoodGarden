// CHANGE EMAIL
document.getElementById("changeEmailBtn").addEventListener("click", () => {
    const email = document.getElementById("newEmail").value;

    if (!email) {
        alert("Please enter a new email");
        return;
    }

    // TODO: connect to backend
    console.log("Updating email to:", email);
    alert("Email updated (demo)");
});

// CHANGE PASSWORD
document.getElementById("changePasswordBtn").addEventListener("click", () => {
    const password = document.getElementById("newPassword").value;

    if (!password) {
        alert("Please enter a new password");
        return;
    }

    // TODO: connect to backend
    console.log("Updating password");
    alert("Password updated (demo)");
});

// DARK MODE
const toggle = document.getElementById("darkModeToggle");

// Load saved preference
if (localStorage.getItem("darkMode") === "enabled") {
    document.body.classList.add("dark");
    toggle.checked = true;
}

toggle.addEventListener("change", () => {
    if (toggle.checked) {
        document.body.classList.add("dark");
        localStorage.setItem("darkMode", "enabled");
    } else {
        document.body.classList.remove("dark");
        localStorage.setItem("darkMode", "disabled");
    }
});
