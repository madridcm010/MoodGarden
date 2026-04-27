import { loginUser, signupUser } from "./api.js";

document.addEventListener("DOMContentLoaded", function () {

    // ================= LOGIN =================
    const loginBtn = document.getElementById("loginBtn");

    if (loginBtn) {
        loginBtn.addEventListener("click", async function (e) {
            e.preventDefault();

            const email = document.getElementById("email").value.trim();
            const password = document.getElementById("password").value.trim();

            try {
                const data = await loginUser(email, password);

                const userId = typeof data === "object" ? data.user_id : data;
                const username = data.username || email.split("@")[0];

                localStorage.setItem("user_id", userId);
                localStorage.setItem("user_name", username);

                window.location.href = "mood-input-base.html";

            } catch (err) {
                console.error(err);
                alert(err.message);
            }
        });
    }

    // ================= SIGNUP (MISSING PIECE) =================
    const signupForm = document.getElementById("signupForm");

    if (signupForm) {
        signupForm.addEventListener("submit", async function (e) {
            e.preventDefault();

            const name = document.getElementById("name").value.trim();
            const email = document.getElementById("signupEmail").value.trim();
            const password = document.getElementById("signupPassword").value.trim();
            const confirmPassword = document.getElementById("confirmPassword").value.trim();

            if (password !== confirmPassword) {
                alert("Passwords do not match");
                return;
            }

            try {
                const res = await signupUser(name, email, password);

                console.log("SIGNUP RESPONSE:", res);

                window.location.href = "login-page.html";
                alert("Account created successfully!");


            } catch (err) {
                console.error(err);
                alert(err.message);
            }
        });
    }

});

// ================= GET USER =================
export function getUser() {
    return localStorage.getItem("user_id");
}
export function logoutUser() {
    localStorage.removeItem("user_id");
    window.location.href = "index.html";
}
export function getUsername() {
    return localStorage.getItem("user_name");
}