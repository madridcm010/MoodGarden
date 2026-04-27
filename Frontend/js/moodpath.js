import { supabase } from './supabase.js';

const MOOD_TO_PATH = {
  anxious: 'Calm the Storm',
  stressed: 'Calm the Storm',
  overwhelmed: 'Calm the Storm',
  sad: 'Rising from the Low',
  unmotivated: 'Rising from the Low',
  lonely: 'Rising from the Low',
  burnout: 'Rising from the Low',
  angry: 'Reset & Recharge',
  frustrated: 'Reset & Recharge',
  tired: 'Reset & Recharge',
  happy: null,
  calm: null,
  hopeful: null,
  motivated: null,
};

let activeExercise = null;
let exerciseTimer = null;
let timerSeconds = 0;
let currentAssignment = null;
let allExercises = [];

export async function initMoodPath(userId, currentMood) {
  if (!userId) return;

  const container = document.getElementById('moodpath-section');
  if (!container) return;

  container.innerHTML = '<div class="moodpath-loading">Loading your path...</div>';

  try {
    const [pathsResult, exercisesResult] = await Promise.all([
      supabase.from('mood_paths').select('*'),
      supabase.from('mood_exercises').select('*')
    ]);

    if (pathsResult.error || exercisesResult.error) throw new Error('Failed to load path data');

    allExercises = exercisesResult.data;
    const paths = pathsResult.data;

    // Check existing active assignment
    const { data: assignments } = await supabase
      .from('user_mood_path_assignments')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true)
      .maybeSingle();

    currentAssignment = assignments;

    if (currentAssignment) {
      const path = paths.find(p => p.id === currentAssignment.path_id);
      await renderActivePath(userId, currentAssignment, path, paths);
    } else {
      renderPathSelection(userId, paths, currentMood);
    }
  } catch (err) {
    console.error('MoodPath init error:', err);
    container.innerHTML = '<div class="moodpath-error">Could not load your path. Please try again.</div>';
  }
}

function renderPathSelection(userId, paths, currentMood) {
  const container = document.getElementById('moodpath-section');
  const suggestedTitle = MOOD_TO_PATH[currentMood] || null;

  const pathCards = paths.map(path => {
    const isSuggested = path.title === suggestedTitle;
    return `
      <div class="path-card ${isSuggested ? 'path-card--suggested' : ''}" data-path-id="${path.id}">
        ${isSuggested ? '<div class="path-badge">Suggested for you</div>' : ''}
        <div class="path-card-icon">${path.icon}</div>
        <h4 class="path-card-title">${path.title}</h4>
        <p class="path-card-desc">${path.description}</p>
        <div class="path-card-meta">
          <span>${path.total_days} days</span>
          <span>${path.exercise_ids.length} exercises</span>
        </div>
        <button class="path-start-btn" onclick="window.startPath('${path.id}', '${userId}')">
          Start This Path
        </button>
      </div>
    `;
  }).join('');

  container.innerHTML = `
    <div class="moodpath-header">
      <h3 class="moodpath-title">Your MoodPath</h3>
      <p class="moodpath-subtitle">Choose a guided path to work toward a better mood</p>
    </div>
    <div class="path-cards-grid">
      ${pathCards}
    </div>
  `;

  window.startPath = (pathId, uid) => startPath(pathId, uid, paths);
}

async function startPath(pathId, userId, paths) {
  const { error } = await supabase.from('user_mood_path_assignments').insert({
    user_id: userId,
    path_id: pathId,
    current_step: 0,
    completed_exercise_ids: [],
    is_active: true,
    is_completed: false
  });

  if (error) {
    console.error('Failed to start path:', error);
    return;
  }

  const { data: assignment } = await supabase
    .from('user_mood_path_assignments')
    .select('*')
    .eq('user_id', userId)
    .eq('is_active', true)
    .maybeSingle();

  currentAssignment = assignment;
  const path = paths.find(p => p.id === pathId);
  await renderActivePath(userId, assignment, path, paths);
}

async function renderActivePath(userId, assignment, path, paths) {
  const container = document.getElementById('moodpath-section');
  if (!path) return;

  const exercisesForPath = path.exercise_ids
    .map(id => allExercises.find(e => e.id === id))
    .filter(Boolean);

  const completedIds = assignment.completed_exercise_ids || [];
  const totalSteps = exercisesForPath.length;
  const completedCount = completedIds.length;
  const progressPct = totalSteps > 0 ? Math.round((completedCount / totalSteps) * 100) : 0;

  const exerciseItems = exercisesForPath.map((ex, idx) => {
    const done = completedIds.includes(ex.id);
    const isCurrent = !done && idx === completedCount;
    return `
      <div class="exercise-item ${done ? 'exercise-item--done' : ''} ${isCurrent ? 'exercise-item--current' : ''}">
        <div class="exercise-item-check">${done ? '✓' : isCurrent ? '▶' : String(idx + 1)}</div>
        <div class="exercise-item-info">
          <span class="exercise-item-icon">${ex.icon}</span>
          <div>
            <div class="exercise-item-title">${ex.title}</div>
            <div class="exercise-item-meta">${ex.duration_minutes} min · ${ex.difficulty}</div>
          </div>
        </div>
        ${isCurrent ? `<button class="exercise-start-btn" onclick="window.openExercise('${ex.id}')">Begin</button>` : ''}
        ${done ? '<div class="exercise-done-label">Done</div>' : ''}
      </div>
    `;
  }).join('');

  container.innerHTML = `
    <div class="moodpath-header">
      <div class="moodpath-title-row">
        <h3 class="moodpath-title">${path.icon} ${path.title}</h3>
        <button class="path-change-btn" onclick="window.abandonPath('${userId}', '${assignment.id}')">Change Path</button>
      </div>
      <p class="moodpath-subtitle">${path.description}</p>
    </div>

    <div class="moodpath-progress-bar-wrap">
      <div class="moodpath-progress-labels">
        <span>${completedCount} of ${totalSteps} exercises complete</span>
        <span>${progressPct}%</span>
      </div>
      <div class="moodpath-progress-track">
        <div class="moodpath-progress-fill" style="width: ${progressPct}%"></div>
      </div>
    </div>

    <div class="exercise-list">
      ${exerciseItems}
    </div>

    ${completedCount === totalSteps ? `
      <div class="path-complete-banner">
        <div class="path-complete-icon">🎉</div>
        <h4>Path Complete!</h4>
        <p>You have finished <strong>${path.title}</strong>. Amazing work.</p>
        <button class="path-start-btn" onclick="window.completePath('${userId}', '${assignment.id}')">Start a New Path</button>
      </div>
    ` : ''}

    <div id="exercise-modal" class="exercise-modal hidden">
      <div class="exercise-modal-backdrop" onclick="window.closeExercise()"></div>
      <div class="exercise-modal-box">
        <button class="exercise-modal-close" onclick="window.closeExercise()">✕</button>
        <div id="exercise-modal-content"></div>
      </div>
    </div>
  `;

  window.openExercise = (exerciseId) => openExercise(exerciseId, userId, assignment, path, paths);
  window.closeExercise = closeExercise;
  window.abandonPath = (uid, assignId) => abandonPath(uid, assignId, paths);
  window.completePath = (uid, assignId) => completePath(uid, assignId, paths);
}

function openExercise(exerciseId, userId, assignment, path, paths) {
  const ex = allExercises.find(e => e.id === exerciseId);
  if (!ex) return;

  activeExercise = ex;
  timerSeconds = ex.duration_minutes * 60;

  const modal = document.getElementById('exercise-modal');
  const content = document.getElementById('exercise-modal-content');

  const stepsHtml = ex.steps.map((step, i) => `
    <div class="exercise-step" id="step-${i}">
      <div class="exercise-step-num">${i + 1}</div>
      <p class="exercise-step-text">${step}</p>
    </div>
  `).join('');

  content.innerHTML = `
    <div class="exercise-modal-header">
      <span class="exercise-modal-icon">${ex.icon}</span>
      <div>
        <h3 class="exercise-modal-title">${ex.title}</h3>
        <p class="exercise-modal-meta">${ex.duration_minutes} min · ${ex.difficulty} · ${ex.category}</p>
      </div>
    </div>
    <div class="exercise-timer-display" id="exercise-timer">${formatTime(timerSeconds)}</div>
    <div class="exercise-timer-controls">
      <button class="timer-btn" id="timer-start-btn" onclick="window.toggleTimer()">Start Timer</button>
    </div>
    <div class="exercise-steps-list">
      ${stepsHtml}
    </div>
    <div class="exercise-rating-section">
      <p class="exercise-rating-label">How did this feel?</p>
      <div class="exercise-rating-stars" id="rating-stars">
        ${[1,2,3,4,5].map(n => `<button class="star-btn" data-rating="${n}" onclick="window.setRating(${n})">★</button>`).join('')}
      </div>
      <input type="hidden" id="selected-rating" value="0" />
    </div>
    <button class="exercise-complete-btn" onclick="window.markExerciseDone('${exerciseId}', '${userId}', '${assignment.id}', '${path.id}')">
      Mark as Complete
    </button>
  `;

  modal.classList.remove('hidden');

  window.setRating = (n) => {
    document.getElementById('selected-rating').value = n;
    document.querySelectorAll('.star-btn').forEach((btn, i) => {
      btn.classList.toggle('star-btn--active', i < n);
    });
  };

  window.toggleTimer = () => {
    if (exerciseTimer) {
      clearInterval(exerciseTimer);
      exerciseTimer = null;
      document.getElementById('timer-start-btn').textContent = 'Resume Timer';
    } else {
      exerciseTimer = setInterval(() => {
        timerSeconds--;
        document.getElementById('exercise-timer').textContent = formatTime(timerSeconds);
        if (timerSeconds <= 0) {
          clearInterval(exerciseTimer);
          exerciseTimer = null;
          document.getElementById('exercise-timer').textContent = 'Done!';
          document.getElementById('timer-start-btn').textContent = 'Timer Complete';
        }
      }, 1000);
      document.getElementById('timer-start-btn').textContent = 'Pause Timer';
    }
  };

  window.markExerciseDone = async (exId, uid, assignId, pathId) => {
    const rating = parseInt(document.getElementById('selected-rating').value) || null;

    const newCompleted = [...(assignment.completed_exercise_ids || []), exId];
    const path = (await supabase.from('mood_paths').select('*').eq('id', pathId).maybeSingle()).data;
    const total = path ? path.exercise_ids.length : 0;
    const isPathDone = newCompleted.length >= total;

    await supabase.from('user_exercise_progress').insert({
      user_id: uid,
      exercise_id: exId,
      completed: true,
      rating,
      completed_at: new Date().toISOString()
    });

    await supabase.from('user_mood_path_assignments')
      .update({
        completed_exercise_ids: newCompleted,
        current_step: newCompleted.length,
        is_completed: isPathDone,
        completed_at: isPathDone ? new Date().toISOString() : null
      })
      .eq('id', assignId);

    closeExercise();

    const { data: updatedAssignment } = await supabase
      .from('user_mood_path_assignments')
      .select('*')
      .eq('id', assignId)
      .maybeSingle();

    currentAssignment = updatedAssignment;

    const { data: allPaths } = await supabase.from('mood_paths').select('*');
    await renderActivePath(uid, updatedAssignment, path, allPaths);
  };

  window.openExercise = (exId) => openExercise(exId, userId, assignment, path, paths);
}

function closeExercise() {
  if (exerciseTimer) {
    clearInterval(exerciseTimer);
    exerciseTimer = null;
  }
  const modal = document.getElementById('exercise-modal');
  if (modal) modal.classList.add('hidden');
}

async function abandonPath(userId, assignmentId, paths) {
  await supabase.from('user_mood_path_assignments')
    .update({ is_active: false })
    .eq('id', assignmentId);

  currentAssignment = null;

  const { data: pathsData } = await supabase.from('mood_paths').select('*');
  renderPathSelection(userId, pathsData || paths, null);
}

async function completePath(userId, assignmentId, paths) {
  await supabase.from('user_mood_path_assignments')
    .update({ is_active: false, is_completed: true })
    .eq('id', assignmentId);

  currentAssignment = null;

  const { data: pathsData } = await supabase.from('mood_paths').select('*');
  renderPathSelection(userId, pathsData || paths, null);
}

function formatTime(seconds) {
  const m = Math.floor(seconds / 60).toString().padStart(2, '0');
  const s = (seconds % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}
