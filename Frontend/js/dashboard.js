import { getUser } from './auth.js';
import { fetchMoodLogs, fetchRecommendations } from './api.js';

document.addEventListener("DOMContentLoaded", async () => {

    const userId = getUser();

    if (!userId) {
        window.location.href = "login-page.html";
        return;
    }

    // ❌ FIX: no user.username (doesn't exist)
    document.getElementById("welcomeText").innerText =
        `Welcome back 🌱 (User ${userId})`;

    loadDashboard(userId);
});

async function loadDashboard(userId) {
    try {
        const data = await fetchMoodLogs();
        console.log("MOOD LOGS RAW:", data);

        const logs = Array.isArray(data)
            ? data
            : data.results || data.moods || [];

        displayTodayMood(logs);
        displayRecentLogs(logs);

        const recs = await fetchRecommendations(userId);
        console.log("RECS RAW:", recs);

        displayRecommendations(recs);

    } catch (err) {
        console.error("DASHBOARD ERROR:", err);
    }
}

// 🟢 TODAY MOOD
function displayTodayMood(logs) {
    const todayLog = logs[0]; // latest entry

    document.getElementById("todayMood").innerText =
        todayLog
            ? `${todayLog.mood_category} (${todayLog.cleaned_text})`
            : "No mood logged today";
}

// 📝 RECENT LOGS
function displayRecentLogs(logs) {
    const list = document.getElementById("recentLogs");
    list.innerHTML = "";
    

    logs.slice(0, 5).forEach(log => {
        const li = document.createElement("li");

        li.textContent = `${log.mood_category}: ${log.cleaned_text}`;

        list.appendChild(li);
    });
}

// 🎯 RECOMMENDATIONS
function displayRecommendations(data) {
    const list = document.getElementById("recommendations");

    if (!list) {
        console.error("❌ recommendations element not found");
        return;
    }

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

// ⚙️ SETTINGS
document.getElementById("settingsBtn").onclick = () => {
    window.location.href = "settings.html";
};

// 🚪 LOGOUT FIXED
document.getElementById("logoutBtn").onclick = () => {
    localStorage.removeItem("user_id");
    window.location.href = "login-page.html";
};