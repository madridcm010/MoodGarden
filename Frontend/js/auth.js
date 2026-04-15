import { loginUser, signupUser } from "./api.js";

document.addEventListener("DOMContentLoaded", function () {

    const loginBtn = document.getElementById("loginBtn");

    if (loginBtn) {
        loginBtn.addEventListener("click", async function (e) {
            e.preventDefault();

            const email = document.getElementById("email").value.trim();
            const password = document.getElementById("password").value.trim();

            if (!email || !password) {
                alert("Please enter email and password");
                return;
            }

            try {
                const data = await loginUser(email, password);

                console.log("LOGIN RESPONSE:", data);

                const userId = typeof data === "object" ? data.user_id : data;

                if (!userId) {
                    throw new Error("No user_id returned from backend");
                }

                localStorage.setItem("user_id", userId);

                window.location.href = "mood-input-base.html";

            } catch (err) {
                alert(err.message);
                console.error(err);
            }
        });
    }

});

// ✅ MUST BE OUTSIDE EVERYTHING
export function getUser() {
    return localStorage.getItem("user_id");
}