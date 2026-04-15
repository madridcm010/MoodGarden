import { submitMood } from './api.js';

document.addEventListener("DOMContentLoaded", () => {
console.log("SCRIPT LOADED");
console.log("About to attach DOMContentLoaded");
    console.log("DOM READY");

    const btn = document.getElementById("nextBtn");
    console.log("nextBtn element:", btn);


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


    // INTENSITY HANDLING
    const slider = document.getElementById("intensitySlider");
    const intensityText = document.getElementById("intensityValue");

    const intensityMap = {
        1: "Very Low",
        2: "Low",
        3: "Neutral",
        4: "High",
        5: "Very High"
    };

    let intensity = slider.value;

    function updateIntensityDisplay(value) {
        intensityText.innerText = `Intensity: ${intensityMap[value]}`;
    }

    updateIntensityDisplay(slider.value);

    slider.addEventListener("input", () => {
        intensity = slider.value;
        updateIntensityDisplay(intensity);
    });
    //  Handle submit
    document.getElementById("nextBtn").addEventListener("click", async () => {

        const note = document.getElementById("moodNote").value;
        console.log("CLICKED");

        if (!note.trim()) {
            alert("Please write something about your mood");
            return;
        }

        try {
            await submitMood(mood, note, intensity);

            window.location.href= "dashboard.html";
            alert("Mood submitted successfully 🌱");

            // Clear stored mood
            console.log("Redirecting now...");
            
            // Go to dashboard

            //localStorage.removeItem("selectedMood");
        } catch (err) {
            console.error(err);
            alert("Failed to submit mood");
        }
    });
});
