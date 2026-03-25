document.addEventListener("DOMContentLoaded", function () {

    let selectedMood = null;

    // ================= MOOD BUTTONS =================
    const moods = [
        { id: "happyMoodBtn", value: "happy" },
        { id: "sadMoodBtn", value: "sad" },
        { id: "angryMoodBtn", value: "angry" },
        { id: "anxiousMoodBtn", value: "anxious" },
        { id: "calmMoodBtn", value: "calm" }
    ];

    moods.forEach(mood => {
        const btn = document.getElementById(mood.id);

        if (btn) {
            btn.addEventListener("click", function () {
                selectedMood = mood.value;
                console.log("Selected:", selectedMood);

                btn.style.border = "3px solid green";
            });
        }
    });

    // ================= NEXT BUTTON =================
    const nextBtn = document.getElementById("nextBtn");

    if (nextBtn) {
        nextBtn.addEventListener("click", async function () {

            if (!selectedMood) {
                alert("Please select a mood first");
                return;
            }

            const noteInput = document.getElementById("moodNote");
            const note = noteInput ? noteInput.value : "";

            try {
                await submitMood(selectedMood, note);

                window.location.href = "recommendations.html";

            } catch (err) {
                alert("Error saving mood");
                console.error(err);
            }

        });
    }

});
