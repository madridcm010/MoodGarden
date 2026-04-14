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
        "burnout": {
            "short_reflection": "You seem mentally worn down right now.",
            "supportive_reflection": "You may be running on empty. It may help to step back, rest, and lower the pressure where you can."
        },
        "unmotivated": {
            "short_reflection": "It seems hard to get going right now.",
            "supportive_reflection": "That happens sometimes. Try starting with one very small task so things feel easier to begin."
        },
        "lonely": {
            "short_reflection": "You seem disconnected or alone right now.",
            "supportive_reflection": "Feeling lonely can be heavy. Reaching out to one person you trust may help you feel a little more supported."
        },
        "hopeful": {
            "short_reflection": "You seem to still see some good ahead.",
            "supportive_reflection": "That hope matters. Try to hold onto it and keep moving toward what is helping you feel better."
        },
        "guilty": {
            "short_reflection": "It sounds like something is weighing on your mind.",
            "supportive_reflection": "Guilt can feel heavy. Try to focus on what you can learn, repair, or do differently moving forward."
        },
        "ashamed": {
            "short_reflection": "You seem to be feeling hard on yourself right now.",
            "supportive_reflection": "Try to give yourself some grace. One moment or mistake does not define who you are."
        },
        "frustrated": {
            "short_reflection": "It sounds like things are really getting on your nerves.",
            "supportive_reflection": "Frustration can build up fast. Taking a short pause and resetting may help before trying again."
        },
        "overwhelmed": {
            "short_reflection": "It seems like too much is hitting you at once.",
            "supportive_reflection": "When everything feels like a lot, try shrinking it down to one next step instead of the whole problem."
        },
        "neutral": {
            "short_reflection": "Your mood seems fairly balanced right now.",
            "supportive_reflection": "I could not fully tell your mood from the text, but taking a moment to reflect on how your day is going may help you figure out what you need next."
        }
    }

    return reflections.get(category, reflections["neutral"])