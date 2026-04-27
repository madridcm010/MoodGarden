import { fetchMoodLogs } from './api.js';

document.addEventListener("DOMContentLoaded", async () => {
    const data = await fetchMoodLogs();
    const logs = Array.isArray(data) ? data : data.results || [];

    const mood = logs[0]?.mood_category || "unknown";
    document.getElementById("moodText").innerText =
        `You are currently feeling: ${mood}`;

    loadPaths(mood);
});

function loadPaths(mood) {
    const exercises = getExercisePath(mood);
    const hobbies = getHobbyPath(mood);

    document.getElementById("exerciseList").innerHTML =
        exercises.map(step => `<li>${step}</li>`).join("");

    document.getElementById("hobbyList").innerHTML =
        hobbies.map(step => `<li>${step}</li>`).join("");
}

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
