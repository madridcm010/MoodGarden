const BASE_URL = "http://localhost:8000";

// LOGIN API
async function loginUser(email, password) {
    const res = await fetch(`${BASE_URL}/auth/login`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
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
async function signupUser(name, email, password) {
    const res = await fetch(`${BASE_URL}/auth/register`, {
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
    const response = await fetch("http://127.0.0.1:8000/ai/analyze", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            text: `${mood}. ${note}`,
            store_result: true
        })
    });

    if (!response.ok) {
        throw new Error("API failed");
    }

    const data = await response.json();

    // Save result for next page
    localStorage.setItem("aiResult", JSON.stringify(data));
}
