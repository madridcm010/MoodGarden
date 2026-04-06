import { getUser } from './auth.js';
import { fetchMoodLogs, fetchRecommendations } from './api.js';

document.addEventListener("DOMContentLoaded", async () => {
  const user = getUser();

  if (!user) {
    window.location.href = "login.html";
    return;
  }

  document.getElementById("welcomeText").innerText =
    `Welcome back, ${user.username} 🌱`;

  loadDashboard();
});

async function loadDashboard() {
  try {
    const logs = await fetchMoodLogs();
    displayTodayMood(logs);
    displayRecentLogs(logs);
    renderChart(logs);

    const recs = await fetchRecommendations();
    displayRecommendations(recs);

  } catch (err) {
    console.error(err);
  }
}

// 🟢 Today's Mood
function displayTodayMood(logs) {
  const today = new Date().toDateString();

  const todayLog = logs.find(log =>
    new Date(log.date).toDateString() === today
  );

  document.getElementById("todayMood").innerText =
    todayLog ? `${todayLog.mood} (Intensity: ${todayLog.intensity})`
             : "No mood logged today";
}

// 📝 Recent Logs
function displayRecentLogs(logs) {
  const list = document.getElementById("recentLogs");
  list.innerHTML = "";

  logs.slice(0, 5).forEach(log => {
    const li = document.createElement("li");
    li.textContent = `${log.date}: ${log.mood} (${log.intensity})`;
    list.appendChild(li);
  });
}

// 📊 Chart.js Emotion Analysis
function renderChart(logs) {
  const moodCounts = {};

  logs.forEach(log => {
    moodCounts[log.mood] = (moodCounts[log.mood] || 0) + 1;
  });

  const ctx = document.getElementById("emotionChart");

  new Chart(ctx, {
    type: 'pie',
    data: {
      labels: Object.keys(moodCounts),
      datasets: [{
        data: Object.values(moodCounts),
      }]
    }
  });
}

// 🎯 Recommendations
function displayRecommendations(recs) {
  const list = document.getElementById("recommendations");
  list.innerHTML = "";

  recs.forEach(rec => {
    const li = document.createElement("li");
    li.textContent = rec;
    list.appendChild(li);
  });
}

// ⚙️ Buttons
document.getElementById("settingsBtn").onclick = () => {
  window.location.href = "settings.html";
};

document.getElementById("logoutBtn").onclick = () => {
  localStorage.removeItem("user");
  window.location.href = "login.html";
};
