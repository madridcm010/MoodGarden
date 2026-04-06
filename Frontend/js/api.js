const BASE_URL = "http://localhost:8000";

// ================= LOGIN =================
export async function loginUser(email, password) {
    const res = await fetch(`${BASE_URL}/auth/login`, {
        method: "POST",
      headers: {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${localStorage.getItem("token")}`
}
        body: JSON.stringify({
            email: email,
            password: password
        })
    });

    if (!res.ok) {
        throw new Error("Invalid login credentials");
    }

    return await res.json();
}

// ================= SIGNUP =================
export async function signupUser(name, email, password) {
    const res = await fetch(`${BASE_URL}/auth/register`, {
        method: "POST",
       headers: {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${localStorage.getItem("token")}`
}
        body: JSON.stringify({
            name: name,
            email: email,
            password: password
        })
    });

    if (!res.ok) {
        throw new Error("Signup failed");
    }

    return await res.json();
}

// ================= SUBMIT MOOD =================
export async function submitMood(mood, note) {
    const response = await fetch(`${BASE_URL}/ai/analyze`, {
        method: "POST",
      headers: {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${localStorage.getItem("token")}`
}
        body: JSON.stringify({
            text: `${mood}. ${note}`,
            store_result: true
        })
    });

    if (!response.ok) {
        throw new Error("API failed");
    }

    const data = await response.json();

    localStorage.setItem("aiResult", JSON.stringify(data));
}

// ================= FETCH MOOD LOGS =================
export async function fetchMoodLogs() {
    const res = await fetch(`${BASE_URL}/api/moods`, {
        headers: {
            "Authorization": `Bearer ${localStorage.getItem("token")}`
        }
    });

    if (!res.ok) {
        throw new Error("Failed to fetch mood logs");
    }

    return await res.json();
}

// ================= FETCH RECOMMENDATIONS =================
export async function fetchRecommendations() {
    const res = await fetch(`${BASE_URL}/api/recommendations`, {
        headers: {
            "Authorization": `Bearer ${localStorage.getItem("token")}`
        }
    });

    if (!res.ok) {
        throw new Error("Failed to fetch recommendations");
    }

    return await res.json();
}
// ========= DASHBOARD FUNCTIONS ========== //
export async function fetchMoodLogs() {
  const res = await fetch("/api/moods");
  return await res.json();
}

export async function fetchRecommendations() {
  const res = await fetch("/api/recommendations");
  return await res.json();
}
