// CHANGE EMAIL
import { getUser } from "./auth.js";

// CHANGE EMAIL
document.getElementById("changeEmailBtn").addEventListener("click", async () => {
    const email = document.getElementById("newEmail").value;
    const userId = getUser();

    if (!email) {
        alert("Please enter a new email");
        return;
    }

    const res = await fetch("http://127.0.0.1:8000/settings/update-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: userId, new_email: email })
    });

    const data = await res.json();

    if (data.success) {
        alert("Email updated successfully!");
    } else {
        alert(data.detail || "Error updating email");
    }
});

// CHANGE PASSWORD
document.getElementById("changePasswordBtn").addEventListener("click", async () => {
    const password = document.getElementById("newPassword").value;
    const userId = getUser();

    if (!password) {
        alert("Please enter a new password");
        return;
    }

    const res = await fetch("http://127.0.0.1:8000/settings/update-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: userId, new_password: password })
    });

    const data = await res.json();

    if (data.success) {
        alert("Password updated successfully!");
    } else {
        alert(data.detail || "Error updating password");
    }
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
