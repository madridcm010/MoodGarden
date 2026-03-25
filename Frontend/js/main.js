document.addEventListener("DOMContentLoaded", function () {

    // ================= LANDING PAGE =================
    const authBtn = document.getElementById("authBtn");

    if (authBtn) {
        authBtn.addEventListener("click", function () {
            window.location.href = "lgn-page.html";
        });
    }

    const startBtn = document.getElementById("startGrowingBtn");

    if (startBtn) {
        startBtn.addEventListener("click", function () {
            window.location.href = "mood-input-happy.html";
        });
    }

    // ================= RECOMMENDATIONS PAGE =================
    const logMoreBtn = document.getElementById("logMoreBtn");

    if (logMoreBtn) {
        logMoreBtn.addEventListener("click", function () {
            window.location.href = "mood-input-happy.html";
        });
    }

    // ================= PROTECT PAGES =================
    const isLoggedIn = localStorage.getItem("loggedIn");

    const protectedPages = [
        "recommendations.html",
        "mood-input-happy.html",
        "mood-input-sad.html",
        "mood-input-angry.html",
        "mood-input-anxious.html",
        "mood-input-calm.html"
    ];

    const currentPage = window.location.pathname.split("/").pop();

    if (protectedPages.includes(currentPage) && !isLoggedIn) {
        alert("Please log in first");
        window.location.href = "lgn-page.html";
    }

});
