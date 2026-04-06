document.addEventListener("DOMContentLoaded", () => {
    const data = JSON.parse(localStorage.getItem("aiResult"));

    if (!data) return;

    const actionCard = document.getElementById("actionCard");
    const suggestionCard = document.getElementById("suggestionCard");

    if (actionCard) {
        actionCard.innerText = `Recommended Action: ${data.short_reflection}`;
    }

    if (suggestionCard) {
        suggestionCard.innerText = `Next Suggestion: ${data.supportive_reflection}`;
    }
});