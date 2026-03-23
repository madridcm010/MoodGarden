document.addEventListener("DOMContentLoaded", function () {

    // Login button
    const authBtn = document.getElementById("authBtn");
    if (authBtn) {
        authBtn.addEventListener("click", function () {
            window.location.href = "lgn-page.html";
        });
    }

    // Start growing button
    const startBtn = document.getElementById("startGrowingBtn");
    if (startBtn) {
        startBtn.addEventListener("click", function () {
            window.location.href = "dashboard.html";
        });
    }

});
