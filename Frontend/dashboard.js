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

    updateStats(logs);
    
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


/* =========================
   📊 STAT CARDS
========================= */

function updateStats(logs) {
  if (!logs || logs.length === 0) return;

  updateMostCommonMood(logs);
  updateEntriesThisWeek(logs);
  updateStreak(logs);
  updateTrend(logs);
}


// 😊 MOST COMMON MOOD
function updateMostCommonMood(logs) {
  const counts = {};

  logs.forEach(log => {
    counts[log.mood] = (counts[log.mood] || 0) + 1;
  });

  const mostCommon = Object.keys(counts).reduce((a, b) =>
    counts[a] > counts[b] ? a : b
  );

  document.getElementById("mostMood").innerText = mostCommon;
}


// 📅 ENTRIES THIS WEEK
function updateEntriesThisWeek(logs) {
  const now = new Date();
  const weekAgo = new Date();
  weekAgo.setDate(now.getDate() - 7);

  const weekLogs = logs.filter(log =>
    new Date(log.date) >= weekAgo
  );

  document.getElementById("entries").innerText =
    weekLogs.length;
}


// 🔥 CURRENT STREAK
function updateStreak(logs) {
  const sorted = logs
    .map(log => new Date(log.date).toDateString())
    .sort((a, b) => new Date(b) - new Date(a));

  let streak = 1;

  for (let i = 1; i < sorted.length; i++) {
    const prev = new Date(sorted[i - 1]);
    const curr = new Date(sorted[i]);

    const diff =
      (prev - curr) / (1000 * 60 * 60 * 24);

    if (diff === 1) {
      streak++;
    } else {
      break;
    }
  }

  document.getElementById("streak").innerText =
    streak + " days";
}


// 📈 MOOD TREND
function updateTrend(logs) {
  const positiveMoods = ["happy", "calm", "excited"];

  const positiveCount = logs.filter(log =>
    positiveMoods.includes(log.mood.toLowerCase())
  ).length;

  const percent =
    (positiveCount / logs.length) * 100;

  document.getElementById("progress").style.width =
    percent + "%";

  if (percent > 60) {
    document.getElementById("trend").innerText =
      "Improving";
  } else if (percent > 40) {
    document.getElementById("trend").innerText =
      "Stable";
  } else {
    document.getElementById("trend").innerText =
      "Needs Attention";
  }
}
