import { fetchMoodLogs } from './api.js';

document.addEventListener("DOMContentLoaded", async () => {
    const data = await fetchMoodLogs();
    const logs = Array.isArray(data) ? data : data.results || [];

    // ⭐ Sort newest → oldest
    logs.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    // ⭐ Use user-selected mood first, fallback to AI mood
    const mood = logs[0]?.user_selected_mood || logs[0]?.mood_category || "unknown";

    document.getElementById("moodText").innerText =
        `You are currently feeling: ${mood}`;

    loadPaths(mood);
});

function loadPaths(mood) {
    document.getElementById("exerciseList").innerHTML =
        getExercisePath(mood).map(step => `<li>${step}</li>`).join("");

    document.getElementById("hobbyList").innerHTML =
        getHobbyPath(mood).map(step => `<li>${step}</li>`).join("");

    document.getElementById("mindfulnessList").innerHTML =
        getMindfulnessPath(mood).map(step => `<li>${step}</li>`).join("");

    document.getElementById("socialList").innerHTML =
        getSocialPath(mood).map(step => `<li>${step}</li>`).join("");
}

/* =========================
   PATH GENERATORS
========================= */

function getExercisePath(mood) {
    switch (mood.toLowerCase()) {
        case "happy":
            return ["Light jog", "Stretch 5 minutes", "Dance to a song"];
        case "calm":
            return ["10-min yoga", "Deep breathing", "Slow walk"];
        case "sad":
            return ["Short walk", "Gentle stretching", "Breathing reset"];
        case "angry":
            return ["Fast walk", "Punch pillow exercise", "Cooldown breaths"];
        default:
            return ["Walk 5 minutes", "Stretch arms", "10 deep breaths"];
    }
}

function getHobbyPath(mood) {
    switch (mood.toLowerCase()) {
        case "happy":
            return ["Draw something fun", "Play a game", "Upbeat music"];
        case "calm":
            return ["Read a book", "Make tea", "Soft music"];
        case "sad":
            return ["Journal thoughts", "Comfort show", "Gentle music"];
        case "angry":
            return ["Write feelings", "Rhythm game", "Intense music"];
        default:
            return ["Journal 5 minutes", "Listen to music", "Small creative task"];
    }
}

function getMindfulnessPath(mood) {
    switch (mood.toLowerCase()) {
        case "happy":
            return ["Gratitude journaling", "5-min meditation", "Mindful breathing"];
        case "calm":
            return ["Body scan meditation", "Deep breathing", "Mindful tea ritual"];
        case "sad":
            return ["Grounding exercise", "Affirmations", "Slow breathing"];
        case "angry":
            return ["Cooling breath", "Mindful pause", "Write out emotions"];
        default:
            return ["5-min breathing", "Short meditation", "Mindful awareness"];
    }
}

function getSocialPath(mood) {
    switch (mood.toLowerCase()) {
        case "happy":
            return ["Share good news with a friend", "Send a meme", "Call someone you like"];
        case "calm":
            return ["Chat with a close friend", "Send a thoughtful message", "Spend time with someone"];
        case "sad":
            return ["Reach out for support", "Talk to someone you trust", "Join a group chat"];
        case "angry":
            return ["Vent safely to a friend", "Ask for space respectfully", "Talk after cooling down"];
        default:
            return ["Message a friend", "Join a conversation", "Share something meaningful"];
    }
}
