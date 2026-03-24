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

    // ================= LOG MORE BUTTON (Recommendations Page) =================
    const logMoreBtn = document.getElementById("logMoreBtn");

    if (logMoreBtn) {
        logMoreBtn.addEventListener("click", function () {
            window.location.href = "dashboard.html"; // or mood logging page
        });
    }

    // ================= CHECK LOGIN STATUS =================
    const isLoggedIn = localStorage.getItem("loggedIn");

    if (!isLoggedIn && window.location.pathname.includes("recommendations.html")) {
        alert("Please log in first");
        window.location.href = "lgn-page.html";
    }

});
