const BASE_URL = "http://localhost:8000";

// LOGIN API
async function loginUser(username, password) {
    const res = await fetch(`${BASE_URL}/auth/login`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            username: username,
            password: password
        })
    });

    if (!res.ok) {
        throw new Error("Invalid login credentials");
    }

    return await res.json();
}

// ================= SIGNUP =================
async function signupUser(name, email, password) {
    const res = await fetch(`${BASE_URL}/auth/signup`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
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
async function submitMood(mood, note) {
    const res = await fetch(`${BASE_URL}/mood`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            mood: mood,
            note: note
        })
    });

    if (!res.ok) {
        throw new Error("Failed to save mood");
    }

    return await res.json();
}
