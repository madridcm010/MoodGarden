document.addEventListener("DOMContentLoaded", function () {

    // ================= LOGIN =================
    const loginBtn = document.getElementById("loginBtn");

    if (loginBtn) {
        loginBtn.addEventListener("click", async function () {

            const email = document.getElementById("email").value.trim();
            const password = document.getElementById("password").value.trim();

            if (!email || !password) {
                alert("Please enter email and password");
                return;
            }

            try {
                await loginUser(email, password);

                localStorage.setItem("loggedIn", "true");

                window.location.href = "mood-input-base.html";

            } catch (err) {
                alert(err.message);
                console.error(err);
            }

        });
    }

    // ================= SIGNUP =================
    const signupForm = document.getElementById("signupForm");

    if (signupForm) {
        signupForm.addEventListener("submit", async function (e) {
            e.preventDefault();

            const name = document.getElementById("name").value;
            const email = document.getElementById("signupEmail").value.trim();
            const password = document.getElementById("signupPassword").value.trim();
            const confirmPassword = document.getElementById("confirmPassword").value.trim();

            if (!email || !password || !confirmPassword) {
                alert("Please fill all required fields");
                return;
            }

            if (password !== confirmPassword) {
                alert("Passwords do not match");
                return;
            }

            try {
                await signupUser(name, email, password);

                alert("Account created successfully!");

                window.location.href = "lgn-page.html";

            } catch (err) {
                alert(err.message);
                console.error(err);
            }
        });
    }

});
