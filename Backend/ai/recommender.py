def get_reflections(category: str):
    reflections = {
        "happy": {
            "short_reflection": "You seem to be in a positive place right now.",
            "supportive_reflection": "That is a good place to be. Try to hold onto what is helping you feel this way and keep that energy going."
        },
        "sad": {
            "short_reflection": "It sounds like you are having a hard moment right now.",
            "supportive_reflection": "It is okay to have rough days. Try to give yourself a little space, breathe, and take one small step that feels manageable."
        },
        "stressed": {
            "short_reflection": "It sounds like a lot is weighing on you right now.",
            "supportive_reflection": "You may have a lot on your mind right now. Taking things one step at a time can help make everything feel more manageable."
        },
        "anxious": {
            "short_reflection": "You seem uneasy and mentally overloaded right now.",
            "supportive_reflection": "Your mind may be moving fast right now. Slowing down, breathing, and focusing on what you can control may help a little."
        },
        "angry": {
            "short_reflection": "It seems like something is really frustrating you.",
            "supportive_reflection": "It makes sense to feel frustrated sometimes. A short pause before reacting may help you reset and think clearly."
        },
        "calm": {
            "short_reflection": "You seem grounded and steady right now.",
            "supportive_reflection": "You seem to be in a steady place. This can be a good time to reflect, recharge, or keep a healthy routine going."
        },
        "tired": {
            "short_reflection": "You sound mentally or physically drained.",
            "supportive_reflection": "You sound drained. Rest, water, food, and a break from pressure might help you recover some energy."
        },
        "confused": {
            "short_reflection": "It sounds like things feel unclear right now.",
            "supportive_reflection": "Things may feel unclear right now. Breaking the problem into smaller pieces can make it easier to handle."
        },
        "motivated": {
            "short_reflection": "You seem focused and ready to keep moving.",
            "supportive_reflection": "You seem locked in and ready to move forward. This is a good time to keep building momentum."
        },
        "neutral": {
            "short_reflection": "Your mood seems fairly balanced right now.",
            "supportive_reflection": "I could not fully tell your mood from the text, but taking a moment to reflect on how your day is going may help you figure out what you need next."
        }
    }

    return reflections.get(category, reflections["neutral"])