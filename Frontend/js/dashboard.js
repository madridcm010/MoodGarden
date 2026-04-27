import { getUser,getUsername } from './auth.js';
import { fetchMoodLogs, fetchRecommendations } from './api.js';
const moodColors = {
  happy: "#7ed957",
  sad: "#f6a623",
  stressed: "#ff6b6b",
  anxious: "#9f7aea",
  angry: "#e05252",
  calm: "#4facfe",
  burnout: "#8d99ae",
  unmotivated: "#a0aec0",
  lonely: "#6c757d",
  confused: "#f9ca24",
  hopeful: "#81e6d9",
  guilty: "#f4a261",
  ashamed: "#e76f51",
  tired: "#b08968",
  frustrated: "#d62828",
  overwhelmed: "#e5989b",
  motivated: "#48bb78",
  neutral: "#cbd5e0",
  unknown: "#a0aec0"
};

document.addEventListener("DOMContentLoaded", async () => {

  const userId = getUser();

  if (!userId) {
    window.location.href = "login-page.html";
    return;
  }

  const username = getUsername();
  document.getElementById("welcomeText").innerText =
    `Welcome back 🌱 ${username}`;

  loadDashboard(userId);
});

async function loadDashboard(userId) {
  try {
    const data = await fetchMoodLogs();
    const logs = Array.isArray(data)
      ? data
      : data.results || data.moods || [];

    logs.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    displayTodayMood(logs);
    displayRecentLogs(logs);

    renderChart(logs); // ← ADD THIS

    const recs = await fetchRecommendations(userId);
    displayRecommendations(recs);

    const currentMood = logs[0]?.user_selected_mood || logs[0]?.mood_category || null;
    renderMoodPath(currentMood);
    updateStats(logs);
    renderHeatmap(logs);

  } catch (err) {
    console.error("DASHBOARD ERROR:", err);
    renderMoodPath(null);
  }
}

/* =========================
   MOODPATH SYSTEM
========================= */

function renderMoodPath(currentMood) {
  const container = document.getElementById("moodpath-section");

  

  const exercises = getExercisePath(currentMood);
  const hobbies = getHobbyPath(currentMood);

  container.innerHTML = `
        <p>You are currently feeling <strong>${currentMood}</strong>.</p>
        

        <div class="path-options">

            <div class="path-card" id="exercisePath">
               
                
            </div>

            <div class="path-card" id="hobbyPath">
                
                
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
      ? `${todayLog.user_selected_mood || todayLog.mood_category} (${todayLog.cleaned_text})`
      : "No mood logged today";
}

function displayRecentLogs(logs) {
  const list = document.getElementById("recentLogs");
  list.innerHTML = "";

  logs.slice(0, 5).forEach(log => {
    const li = document.createElement("li");
    li.textContent = `${log.user_selected_mood || log.mood_category}: ${log.cleaned_text}`;
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
    `Recent trend: ${emotion === "neutral"
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
/* =========================
   EMOTION ANALYSIS CHART
========================= */

let emotionChartInstance = null;

function renderChart(logs) {
  const ctx = document.getElementById("emotionChart");

  if (!ctx) {
    console.error("Emotion chart canvas not found");
    return;
  }

  if (!logs || logs.length === 0) {
    console.warn("No logs available for chart");
    return;
  }

  // Count moods
  const moodCounts = {};
  logs.forEach(log => {
    const mood = (log.user_selected_mood || log.mood_category || "unknown").toLowerCase();
    moodCounts[mood] = (moodCounts[mood] || 0) + 1;
  });

  // Destroy old chart if it exists
  if (emotionChartInstance) {
    emotionChartInstance.destroy();
  }

  emotionChartInstance = new Chart(ctx, {
    type: 'pie',
    data: {
      labels: Object.keys(moodCounts),
      datasets: [{
        data: Object.values(moodCounts),
        backgroundColor: Object.keys(moodCounts).map(mood =>
          moodColors[mood] || moodColors.unknown
        ),
        borderWidth: 1
      }]
    },
    options: {
      plugins: {
        legend: { position: 'bottom' }
      }
    }
  });
}


/* =========================
   📊 STAT CARDS
========================= */

function updateStats(logs) {
  if (!logs || logs.length === 0) return;

  updateMostCommonMood(logs);
  updateEntriesThisWeek(logs);
  updateStreak(logs);
  updateTrend(logs);
  renderHeatmap(logs);
}


// 😊 MOST COMMON MOOD
function updateMostCommonMood(logs) {
  const counts = {};

  logs.forEach(log => {
    const mood = log.user_selected_mood || log.mood_category || "unknown";
    counts[mood] = (counts[mood] || 0) + 1;
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
    new Date(log.created_at) >= weekAgo
  );

  document.getElementById("entries").innerText = weekLogs.length;
}




// 🔥 CURRENT STREAK
function updateStreak(logs) {
  const dates = logs
    .map(log => new Date(log.created_at).toDateString())
    .filter(Boolean);

  const sorted = [...new Set(dates)]
    .sort((a, b) => new Date(b) - new Date(a));

  let streak = 1;

  for (let i = 1; i < sorted.length; i++) {
    const prev = new Date(sorted[i - 1]);
    const curr = new Date(sorted[i]);

    const diff = (prev - curr) / (1000 * 60 * 60 * 24);

    if (diff === 1) {
      streak++;
    } else {
      break;
    }
  }

  document.getElementById("streak").innerText = streak + " days";
}
function moodScore(mood) {
  if (!mood) return 3; // neutral fallback

  const map = {
    happy: 5,
    calm: 4,
    motivated: 4,
    hopeful: 4,
    neutral: 3,
    sad: 2,
    tired: 2,
    stressed: 1,
    anxious: 1,
    angry: 1
  };

  return map[mood.toLowerCase()] || 3;
}

function updateTrend(logs) {
  // Not enough data → default to improving or stable
  if (logs.length < 3) {
    document.getElementById("trend").innerText = "Improving";
    document.getElementById("progress").style.width = "70%";
    return;
  }

  const recent = logs.slice(0, 5);
  const scores = recent.map(log =>
    moodScore(log.user_selected_mood || log.mood_category)
  );

  // If missing values → stable
  if (scores.some(s => isNaN(s))) {
    document.getElementById("trend").innerText = "Stable";
    document.getElementById("progress").style.width = "50%";
    return;
  }

  const avgFirstHalf = (scores[0] + scores[1]) / 2;
  const avgSecondHalf = (scores[scores.length - 1] + scores[scores.length - 2]) / 2;

  let trend = "Stable";
  if (avgSecondHalf > avgFirstHalf) trend = "Improving";
  if (avgSecondHalf < avgFirstHalf) trend = "Declining";

  document.getElementById("trend").innerText = trend;

  const progress = Math.max(0, Math.min(100, (avgSecondHalf - avgFirstHalf + 1) * 50));
  document.getElementById("progress").style.width = progress + "%";
}
//Mood HeatMAP
function renderHeatmap(logs) {
  const grid = document.getElementById("moodHeatmap");
  if (!grid) return;

  grid.innerHTML = "";

  const totalCells = 35; // 5 weeks × 7 days

  for (let i = 0; i < totalCells; i++) {
    const log = logs[i];
    const mood = log
      ? (log.user_selected_mood || log.mood_category || "unknown").toLowerCase()
      : "unknown";

    const color = moodColors[mood] || moodColors.unknown;

    const cell = document.createElement("div");
    cell.classList.add("heatmap-cell");
    cell.style.backgroundColor = color;

    grid.appendChild(cell);
  }
}

document.getElementById("newEntryBtn").onclick = () => {
  window.location.href = "mood-input-base.html";
};
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
