let selectedMood = null;

// Select all mood buttons
const moodButtons = document.querySelectorAll(".mood-button");

moodButtons.forEach(button => {
    button.addEventListener("click", () => {

        // remove previous selection
        moodButtons.forEach(btn => btn.classList.remove("selected"));

        // highlight selected
        button.classList.add("selected");

        // get mood label text
        selectedMood = button.querySelector(".label").innerText.toLowerCase();

        console.log("Selected mood:", selectedMood);
    });
});

// Continue button
document.getElementById("nextBtn").addEventListener("click", () => {

    if (!selectedMood) {
        alert("Please select a mood first");
        return;
    }

    // store mood for next step
    localStorage.setItem("selectedMood", selectedMood);

    // redirect to ONE shared input page
    window.location.href = "mood-details.html";
});
