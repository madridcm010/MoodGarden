import { submitMood } from './api.js';

document.addEventListener("DOMContentLoaded", () => {

    //  Get selected mood from previous page
    const mood = localStorage.getItem("selectedMood");

    // If no mood selected, send user back
    if (!mood) {
        window.location.href = "mood-input-base.html";
        return;
    }

    //  Mood → Emoji mapping
    const moodMap = {
        happy: "😊",
        sad: "😢",
        angry: "😡",
        anxious: "😰",
        calm: "😌"
    };

    // 🎯 Set UI dynamically
    document.getElementById("moodLabel").innerText = mood;
    document.getElementById("moodEmoji").innerText = moodMap[mood] || "😐";

    //  Handle submit
    document.getElementById("nextBtn").addEventListener("click", async () => {

        const note = document.getElementById("moodNote").value;

        if (!note.trim()) {
            alert("Please write something about your mood");
            return;
        }

        try {
            await submitMood(mood, note);

            alert("Mood submitted successfully 🌱");

            // Clear stored mood
            localStorage.removeItem("selectedMood");

            // Go to dashboard
            window.location.href = "dashboard.html";

        } catch (err) {
            console.error(err);
            alert("Failed to submit mood");
        }
    });

});
