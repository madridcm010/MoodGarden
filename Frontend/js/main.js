document.addEventListener("DOMContentLoaded", function () {

    const authBtn = document.getElementById("authBtn");

    if (authBtn) {
        authBtn.addEventListener("click", function () {
            console.log("Navigating to login page...");
            window.location.href = "lgn-page.html";
        });
    }

});
