import { getUser } from './auth.js';
import { fetchMoodLogs, fetchRecommendations } from './api.js';
import { initMoodPath } from './js/moodpath.js';

document.addEventListener("DOMContentLoaded", async () => {
  const user = getUser();

  if (!user) {
    window.location.href = "login.html";
    return;
  }

  const name = user.name || user.username || 'there';
  document.getElementById("welcomeText").innerText = `Welcome back, ${name}`;

  loadDashboard(user);
});

async function loadDashboard(user) {
  try {
    const logs = await fetchMoodLogs();
    displayTodayMood(logs);
    displayRecentLogs(logs);
    updateStats(logs);

    if (Array.isArray(logs) && logs.length > 0) {
      renderChart(logs);
    }

    const recs = await fetchRecommendations();
    displayRecommendations(recs);

    const currentMood = getCurrentMoodFromLogs(logs);
    const userId = user.id || user.user_id || null;
    if (userId) {
      await initMoodPath(userId, currentMood);
    } else {
      initMoodPathWithDemoUser(currentMood);
    }
  } catch (err) {
    console.error('Dashboard load error:', err);
    initMoodPathWithDemoUser(null);
  }
}

function getCurrentMoodFromLogs(logs) {
  if (!logs || logs.length === 0) return null;
  const today = new Date().toDateString();
  const todayLog = logs.find(log => new Date(log.date).toDateString() === today);
  if (todayLog) return todayLog.mood;
  return logs[0]?.mood || null;
}

function initMoodPathWithDemoUser(currentMood) {
  const demoUserId = localStorage.getItem('demo_user_id') || (() => {
    const id = 'demo_' + Math.random().toString(36).slice(2);
    localStorage.setItem('demo_user_id', id);
    return id;
  })();
  initMoodPath(demoUserId, currentMood);
}

function displayTodayMood(logs) {
  const today = new Date().toDateString();
  const todayLog = logs && logs.find(log => new Date(log.date).toDateString() === today);
  document.getElementById("todayMood").innerText =
    todayLog ? `${todayLog.mood} (Intensity: ${todayLog.intensity})` : "No mood logged today";
}

function displayRecentLogs(logs) {
  const list = document.getElementById("recentLogs");
  list.innerHTML = "";
  if (!logs || logs.length === 0) {
    list.innerHTML = '<li>No logs yet</li>';
    return;
  }
  logs.slice(0, 5).forEach(log => {
    const li = document.createElement("li");
    li.textContent = `${log.date}: ${log.mood} (${log.intensity})`;
    list.appendChild(li);
  });
}

function renderChart(logs) {
  const moodCounts = {};
  logs.forEach(log => {
    moodCounts[log.mood] = (moodCounts[log.mood] || 0) + 1;
  });

  const ctx = document.getElementById("emotionChart");
  if (!ctx) return;

  new Chart(ctx, {
    type: 'pie',
    data: {
      labels: Object.keys(moodCounts),
      datasets: [{
        data: Object.values(moodCounts),
        backgroundColor: ['#7ed957','#4facfe','#f6a623','#e05252','#a8d8a8','#f9ca24']
      }]
    },
    options: { plugins: { legend: { position: 'bottom' } } }
  });
}

function displayRecommendations(recs) {
  const list = document.getElementById("recommendations");
  list.innerHTML = "";
  if (!recs || recs.length === 0) {
    list.innerHTML = '<li>Log your mood to get recommendations</li>';
    return;
  }
  recs.forEach(rec => {
    const li = document.createElement("li");
    li.textContent = rec;
    list.appendChild(li);
  });
}

document.getElementById("settingsBtn").onclick = () => {
  window.location.href = "settings.html";
};

document.getElementById("logoutBtn").onclick = () => {
  localStorage.removeItem("user");
  window.location.href = "login.html";
};

function updateStats(logs) {
  if (!logs || logs.length === 0) return;
  updateMostCommonMood(logs);
  updateEntriesThisWeek(logs);
  updateStreak(logs);
  updateTrend(logs);
}

function updateMostCommonMood(logs) {
  const counts = {};
  logs.forEach(log => { counts[log.mood] = (counts[log.mood] || 0) + 1; });
  const mostCommon = Object.keys(counts).reduce((a, b) => counts[a] > counts[b] ? a : b);
  document.getElementById("mostMood").innerText = mostCommon;
}

function updateEntriesThisWeek(logs) {
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);
  const weekLogs = logs.filter(log => new Date(log.date) >= weekAgo);
  document.getElementById("entries").innerText = weekLogs.length;
}

function updateStreak(logs) {
  const sorted = logs
    .map(log => new Date(log.date).toDateString())
    .sort((a, b) => new Date(b) - new Date(a));

  let streak = 1;
  for (let i = 1; i < sorted.length; i++) {
    const diff = (new Date(sorted[i - 1]) - new Date(sorted[i])) / (1000 * 60 * 60 * 24);
    if (diff === 1) streak++;
    else break;
  }
  document.getElementById("streak").innerText = streak + " days";
}

function updateTrend(logs) {
  const positiveMoods = ["happy", "calm", "excited", "hopeful", "motivated"];
  const positiveCount = logs.filter(log => positiveMoods.includes(log.mood.toLowerCase())).length;
  const percent = (positiveCount / logs.length) * 100;

  document.getElementById("progress").style.width = percent + "%";
  document.getElementById("trend").innerText =
    percent > 60 ? "Improving" : percent > 40 ? "Stable" : "Needs Attention";
}
