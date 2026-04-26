/*
  # MoodPath System - Mood Improvement Exercises & Progress Tracking

  ## Summary
  This migration creates the core tables for the MoodPath feature, which tracks users'
  progress through structured mood-improvement exercises over time.

  ## New Tables

  ### mood_exercises
  - Stores all available exercises (breathing, journaling, grounding, gratitude, etc.)
  - Each exercise targets specific mood categories (sad, anxious, stressed, etc.)
  - Includes step-by-step instructions, duration estimate, and category tags

  ### user_exercise_progress
  - Records each time a user completes or starts an exercise
  - Tracks completion status, user rating, and notes
  - Links to mood_exercises via exercise_id

  ### mood_paths
  - A curated sequence of exercises assigned or recommended for a user's mood journey
  - Tracks overall path progress (how many exercises completed out of total)

  ### user_mood_path_assignments
  - Links users to their active or completed mood paths
  - Tracks current step in the path and start/completion dates

  ## Security
  - RLS enabled on all tables
  - Users can only read/write their own progress records
  - Exercises table is readable by all authenticated users (read-only)
*/

-- =====================
-- MOOD EXERCISES TABLE
-- =====================
CREATE TABLE IF NOT EXISTS mood_exercises (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL DEFAULT '',
  category text NOT NULL DEFAULT 'general',
  target_moods text[] NOT NULL DEFAULT '{}',
  steps text[] NOT NULL DEFAULT '{}',
  duration_minutes integer NOT NULL DEFAULT 5,
  difficulty text NOT NULL DEFAULT 'easy',
  icon text NOT NULL DEFAULT '🌿',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE mood_exercises ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read exercises"
  ON mood_exercises FOR SELECT
  TO authenticated
  USING (true);

-- =====================
-- MOOD PATHS TABLE
-- =====================
CREATE TABLE IF NOT EXISTS mood_paths (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL DEFAULT '',
  target_moods text[] NOT NULL DEFAULT '{}',
  exercise_ids uuid[] NOT NULL DEFAULT '{}',
  total_days integer NOT NULL DEFAULT 7,
  icon text NOT NULL DEFAULT '🌱',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE mood_paths ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read mood paths"
  ON mood_paths FOR SELECT
  TO authenticated
  USING (true);

-- ===========================
-- USER EXERCISE PROGRESS TABLE
-- ===========================
CREATE TABLE IF NOT EXISTS user_exercise_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  exercise_id uuid NOT NULL REFERENCES mood_exercises(id) ON DELETE CASCADE,
  completed boolean NOT NULL DEFAULT false,
  rating integer CHECK (rating >= 1 AND rating <= 5),
  notes text DEFAULT '',
  started_at timestamptz DEFAULT now(),
  completed_at timestamptz,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE user_exercise_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own exercise progress"
  ON user_exercise_progress FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own exercise progress"
  ON user_exercise_progress FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own exercise progress"
  ON user_exercise_progress FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ================================
-- USER MOOD PATH ASSIGNMENTS TABLE
-- ================================
CREATE TABLE IF NOT EXISTS user_mood_path_assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  path_id uuid NOT NULL REFERENCES mood_paths(id) ON DELETE CASCADE,
  current_step integer NOT NULL DEFAULT 0,
  completed_exercise_ids uuid[] NOT NULL DEFAULT '{}',
  is_active boolean NOT NULL DEFAULT true,
  is_completed boolean NOT NULL DEFAULT false,
  started_at timestamptz DEFAULT now(),
  completed_at timestamptz,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE user_mood_path_assignments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own path assignments"
  ON user_mood_path_assignments FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own path assignments"
  ON user_mood_path_assignments FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own path assignments"
  ON user_mood_path_assignments FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ====================
-- SEED: EXERCISES DATA
-- ====================
INSERT INTO mood_exercises (title, description, category, target_moods, steps, duration_minutes, difficulty, icon) VALUES
(
  'Box Breathing',
  'A calming breathwork technique used by Navy SEALs to reduce stress and anxiety quickly.',
  'breathwork',
  ARRAY['anxious', 'stressed', 'overwhelmed'],
  ARRAY[
    'Sit upright in a comfortable position with your feet flat on the floor.',
    'Exhale completely through your mouth, pushing all the air out.',
    'Inhale slowly through your nose for 4 counts, feeling your lungs fill.',
    'Hold your breath for 4 counts. Do not clench your jaw.',
    'Exhale slowly through your mouth for 4 counts.',
    'Hold for 4 counts before your next inhale.',
    'Repeat this cycle 4 to 6 times. Notice how your body relaxes.'
  ],
  5, 'easy', '🫁'
),
(
  'Grounding 5-4-3-2-1',
  'An anxiety-relief technique that uses your senses to anchor you to the present moment.',
  'grounding',
  ARRAY['anxious', 'overwhelmed', 'stressed', 'confused'],
  ARRAY[
    'Pause wherever you are and take one slow, deep breath.',
    'Look around and name 5 things you can see right now.',
    'Notice 4 things you can physically feel, like your feet on the floor or your hands.',
    'Listen carefully and identify 3 sounds you can hear in your environment.',
    'Find 2 things you can smell, or recall 2 of your favorite scents.',
    'Name 1 thing you can taste right now.',
    'Take another slow breath. You are grounded and present.'
  ],
  5, 'easy', '🌍'
),
(
  'Gratitude Journaling',
  'Writing down things you are grateful for shifts focus from problems to positives, lifting mood.',
  'journaling',
  ARRAY['sad', 'lonely', 'unmotivated', 'hopeful'],
  ARRAY[
    'Get a notebook or open a notes app on your phone.',
    'Write today''s date at the top.',
    'List 3 things you are genuinely grateful for today. They can be small.',
    'For each item, write one sentence about WHY you are grateful for it.',
    'Write one person you appreciate and what they mean to you.',
    'End by writing one kind thing you did for yourself or someone else recently.',
    'Read back what you wrote slowly. Let the feelings settle.'
  ],
  10, 'easy', '📓'
),
(
  'Progressive Muscle Relaxation',
  'Systematically tense and release muscle groups to reduce physical tension and mental stress.',
  'body',
  ARRAY['stressed', 'anxious', 'tired', 'burnout'],
  ARRAY[
    'Lie down or sit in a comfortable position. Close your eyes.',
    'Take three slow deep breaths to begin.',
    'Tense your feet and toes tightly for 5 seconds, then release. Notice the difference.',
    'Tense your calves and shins for 5 seconds, then release.',
    'Tense your thighs and stomach for 5 seconds, then release.',
    'Tense your hands into fists and clench your arms for 5 seconds, then release.',
    'Tense your shoulders up to your ears for 5 seconds, then release.',
    'Scrunch your face tightly for 5 seconds, then release.',
    'Take three more slow breaths and rest in the relaxation for a minute.'
  ],
  10, 'medium', '💪'
),
(
  'The 3-Good-Things Exercise',
  'A positive psychology exercise that retrains your brain to notice wins and pleasant moments.',
  'reflection',
  ARRAY['sad', 'unmotivated', 'frustrated', 'hopeful'],
  ARRAY[
    'Find a quiet moment, ideally in the evening.',
    'Think back over your day from start to finish.',
    'Identify 3 things that went well today, even tiny ones count.',
    'Write each one down in a sentence or two.',
    'For each thing, write a brief note about WHY it went well.',
    'Read them back and allow yourself to feel the small wins.',
    'Do this for 7 days in a row and notice how your outlook shifts.'
  ],
  10, 'easy', '✅'
),
(
  'Cold Water Reset',
  'A fast physiological technique to interrupt negative emotional spirals and shock the system calm.',
  'body',
  ARRAY['angry', 'frustrated', 'overwhelmed', 'stressed'],
  ARRAY[
    'Go to a sink or bathroom. This works best with immediate access to cold water.',
    'Turn the tap to cold.',
    'Hold your wrists and inner forearms under the cold running water for 30 seconds.',
    'Alternatively, splash cold water on your face three times.',
    'Take a long slow breath through your nose as you feel the cold.',
    'Pat yourself dry and return to your space.',
    'Notice how your emotional intensity has shifted. This works through the dive reflex.'
  ],
  3, 'easy', '💧'
),
(
  'Mood Movement Walk',
  'A 10-minute intentional walk designed to reset your nervous system and break emotional stagnation.',
  'movement',
  ARRAY['sad', 'unmotivated', 'lonely', 'tired', 'burnout'],
  ARRAY[
    'Put on comfortable shoes and step outside if possible.',
    'Start walking at a comfortable pace. Do not look at your phone.',
    'For the first 2 minutes, just notice your surroundings. What do you see?',
    'For the next 3 minutes, sync your breath with your steps. Inhale for 3 steps, exhale for 3.',
    'For the next 3 minutes, think about one thing you are looking forward to, even small.',
    'For the last 2 minutes, walk slightly faster and swing your arms.',
    'Return feeling reset. If you cannot go outside, march in place for 5 minutes.'
  ],
  10, 'easy', '🚶'
),
(
  'Self-Compassion Letter',
  'Write a compassionate letter to yourself as you would to a struggling friend.',
  'journaling',
  ARRAY['ashamed', 'guilty', 'sad', 'lonely'],
  ARRAY[
    'Find a quiet place and something to write with.',
    'Think of a situation that is causing you pain or shame right now.',
    'Imagine a close friend came to you with this exact same problem.',
    'Write a letter to yourself AS IF you were that caring friend.',
    'Include: acknowledgment of the pain, reminders of your humanity, practical kindness.',
    'Do not give advice. Just offer the warmth a good friend would offer.',
    'Fold the letter and read it again later when you need it most.'
  ],
  15, 'medium', '💛'
),
(
  'Momentum Micro-Task',
  'Break through inaction by identifying and completing one small task in under 5 minutes.',
  'productivity',
  ARRAY['unmotivated', 'overwhelmed', 'burnout', 'confused'],
  ARRAY[
    'Identify one thing you have been avoiding or one small thing on your list.',
    'Break it into the very smallest possible first step.',
    'Set a timer for 5 minutes.',
    'Do ONLY that one tiny thing during those 5 minutes.',
    'When the timer goes off, stop if you want or continue riding the momentum.',
    'Write down what you completed.',
    'Notice that starting was harder than doing. Use this to break the next block.'
  ],
  5, 'easy', '⚡'
),
(
  'Evening Wind-Down Ritual',
  'A structured 10-minute pre-sleep routine to transition from the day to restful sleep.',
  'sleep',
  ARRAY['stressed', 'anxious', 'tired', 'overwhelmed'],
  ARRAY[
    'Set a consistent wind-down time each night, 30-60 minutes before sleep.',
    'Dim the lights in your room and put your phone on Do Not Disturb.',
    'Write down 3 things left on your mind to clear mental clutter.',
    'Do 5 minutes of gentle stretching or slow movement.',
    'Prepare your sleep environment: cool, dark, quiet.',
    'Spend 2 minutes doing slow breathing with eyes closed.',
    'Let go of tomorrow. It will still be there when you wake up.'
  ],
  10, 'easy', '🌙'
)
ON CONFLICT DO NOTHING;

-- ====================
-- SEED: MOOD PATHS DATA
-- ====================
INSERT INTO mood_paths (title, description, target_moods, total_days, icon)
VALUES
(
  'Calm the Storm',
  'A 5-day path to reduce anxiety and overwhelm through grounding, breath, and body-based techniques.',
  ARRAY['anxious', 'stressed', 'overwhelmed'],
  5,
  '🌊'
),
(
  'Rising from the Low',
  'A 7-day path to gently lift mood, rebuild energy, and reconnect with yourself when feeling down.',
  ARRAY['sad', 'unmotivated', 'lonely', 'burnout'],
  7,
  '🌅'
),
(
  'Reset & Recharge',
  'A 5-day path for when you feel depleted, frustrated, or just need to break the cycle.',
  ARRAY['angry', 'frustrated', 'tired', 'burnout'],
  5,
  '🔋'
)
ON CONFLICT DO NOTHING;
