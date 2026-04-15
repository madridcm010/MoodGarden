const BASE_URL = "http://localhost:8000";

// ================= LOGIN =================
export async function loginUser(email, password) {
    const res = await fetch(`${BASE_URL}/auth/login`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password })
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
        },
        body: JSON.stringify({ name, email, password })
    });

    if (!res.ok) {
        throw new Error("Signup failed");
    }

    return await res.json();
}

// ================= SUBMIT MOOD =================


export async function submitMood(mood, note) {
    const userId = localStorage.getItem("user_id");

    const response = await fetch(`${BASE_URL}/ai/analyze`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            user_id: userId,
            text: `${mood}. ${note}`
        })
    });

    if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.detail || "submitMood failed");
    }

    const data = await response.json();

    localStorage.setItem("aiResult", JSON.stringify(data));

    return data;
}



// ================= FETCH MOOD LOGS =================
export async function fetchMoodLogs() {
    const userId = localStorage.getItem("user_id");

    const res = await fetch(`${BASE_URL}/api/moods/${userId}`);

    if (!res.ok) {
        throw new Error("Failed to fetch mood logs");
    }

    return await res.json();
}

// ================= FETCH RECOMMENDATIONS =================
export async function fetchRecommendations(userId) {
    const res = await fetch(`${BASE_URL}/ai/summary/${userId}`);

    if (!res.ok) {
        throw new Error("Failed to fetch recommendations");
    }

    return await res.json();
}
