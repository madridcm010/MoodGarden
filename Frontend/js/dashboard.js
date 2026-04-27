import { getUser } from './auth.js';
import { fetchMoodLogs, fetchRecommendations } from './api.js';

document.addEventListener("DOMContentLoaded", async () => {
    const userId = getUser();

    if (!userId) {
        window.location.href = "login-page.html";
        return;
    }

    document.getElementById("welcomeText").innerText =
        `Welcome back 🌱 (User ${userId})`;

    loadDashboard(userId);
});

async function loadDashboard(userId) {
    try {
        const data = await fetchMoodLogs();
        const logs = Array.isArray(data)
            ? data
            : data.results || data.moods || [];

        displayTodayMood(logs);
        displayRecentLogs(logs);

        const recs = await fetchRecommendations(userId);
        displayRecommendations(recs);

        // ⭐ NEW: MoodPath
        const currentMood = logs[0]?.mood_category || null;
        renderMoodPath(currentMood);

    } catch (err) {
        console.error("DASHBOARD ERROR:", err);
        renderMoodPath(null);
    }
}

/* =========================
   MOODPATH SYSTEM
========================= */

function renderMoodPath(mood) {
    const container = document.getElementById("moodpath-section");

    if (!mood) {
        container.innerHTML = `
            <p>No mood logged today.</p>
            <p>Log a mood to get a personalized path.</p>
        `;
        return;
    }

    const exercises = getExercisePath(mood);
    const hobbies = getHobbyPath(mood);

    container.innerHTML = `
        <p>You are currently feeling <strong>${mood}</strong>.</p>
        <p>Choose a path to stay in this mood:</p>

        <div class="path-options">

            <div class="path-card" id="exercisePath">
                <h4>Exercise Path 🏃‍♂️</h4>
                <ul>
                    ${exercises.map(step => `<li>${step}</li>`).join("")}
                </ul>
            </div>

            <div class="path-card" id="hobbyPath">
                <h4>Hobby Path 🎨</h4>
                <ul>
                    ${hobbies.map(step => `<li>${step}</li>`).join("")}
                </ul>
            </div>

        </div>
    `;

    // Add click handlers
    document.getElementById("exercisePath").onclick = () => {
        alert("You selected the Exercise Path. Great choice!");
    };

    document.getElementById("hobbyPath").onclick = () => {
        alert("You selected the Hobby Path. Enjoy your time!");
    };
}

/* =========================
   PATH GENERATORS
========================= */

function getExercisePath(mood) {
    switch (mood.toLowerCase()) {
        case "happy":
            return ["Go for a light jog", "Stretch for 5 minutes", "Dance to a favorite song"];
        case "calm":
            return ["10-minute yoga flow", "Deep breathing exercises", "Slow walk outside"];
        case "sad":
            return ["Short walk", "Gentle stretching", "5-minute breathing reset"];
        case "angry":
            return ["Fast-paced walk", "Punch pillow exercise", "Deep breathing cooldown"];
        default:
            return ["Walk for 5 minutes", "Stretch your arms", "Take 10 deep breaths"];
    }
}

function getHobbyPath(mood) {
    switch (mood.toLowerCase()) {
        case "happy":
            return ["Draw something fun", "Play a game", "Listen to upbeat music"];
        case "calm":
            return ["Read a book", "Make tea", "Listen to soft music"];
        case "sad":
            return ["Write your thoughts", "Watch comfort show", "Listen to gentle music"];
        case "angry":
            return ["Write out your feelings", "Play a rhythm game", "Listen to intense music"];
        default:
            return ["Journal for 5 minutes", "Listen to music", "Do a small creative task"];
    }
}

/* =========================
   EXISTING FUNCTIONS
========================= */

function displayTodayMood(logs) {
    const todayLog = logs[0];
    document.getElementById("todayMood").innerText =
        todayLog
            ? `${todayLog.mood_category} (${todayLog.cleaned_text})`
            : "No mood logged today";
}

function displayRecentLogs(logs) {
    const list = document.getElementById("recentLogs");
    list.innerHTML = "";

    logs.slice(0, 5).forEach(log => {
        const li = document.createElement("li");
        li.textContent = `${log.mood_category}: ${log.cleaned_text}`;
        list.appendChild(li);
    });
}

function displayRecommendations(data) {
    const list = document.getElementById("recommendations");
    list.innerHTML = "";

    const emotion = data.most_common_emotion;
    const total = data.total_entries;

    const recommendations = [
        `You logged ${total} moods`,
        `Your most common emotion is: ${emotion}`,
        `Recent trend: ${
            emotion === "neutral"
                ? "Try adding more emotional detail"
                : "Good emotional awareness!"
        }`
    ];

    recommendations.forEach(text => {
        const li = document.createElement("li");
        li.textContent = text;
        list.appendChild(li);
    });
}
document.getElementById("openMoodPath").onclick = () => {
    window.location.href = "moodpath.html";
};
document.getElementById("settingsBtn").onclick = () => {
    window.location.href = "settings.html";
};

document.getElementById("logoutBtn").onclick = () => {
    localStorage.removeItem("user_id");
    window.location.href = "login-page.html";
};
