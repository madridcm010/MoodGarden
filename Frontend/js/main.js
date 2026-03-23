document.addEventListener("DOMContentLoaded", function () {

    // ================= AUTH BUTTON (Landing Page) =================
    const authBtn = document.getElementById("authBtn");

    if (authBtn) {
        authBtn.addEventListener("click", function () {
            window.location.href = "lgn-page.html";
        });
    }

    // ================= START GROWING BUTTON =================
    const startBtn = document.getElementById("startGrowingBtn");

    if (startBtn) {
        startBtn.addEventListener("click", function () {
            window.location.href = "dashboard.html";
        });
    }

    // ================= CHECK LOGIN STATUS =================
    const isLoggedIn = localStorage.getItem("loggedIn");

    // Example: you can use this later to protect pages
    console.log("User logged in:", isLoggedIn);

});
