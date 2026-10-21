# FocusFlow Planner

## Product specification

### Vision
FocusFlow Planner is a lightweight productivity dashboard for students and self-directed professionals who need a simple way to manage tasks, track habits, and stay on a focused work rhythm without a heavy app or login flow.

### Main user journey
1. Open the planner and review the day at a glance.
2. Add a new task with category, priority, effort, and due date.
3. Filter or search the queue to focus on the most important work.
4. Start a short focus timer to keep a deep-work session on track.
5. Mark habits and complete tasks to build momentum.

### Required interactions
- Create tasks from a form with inline validation.
- Search, filter, and update task status.
- Remove tasks that are no longer needed.
- Track habit completion with quick toggles.
- Run a timer with work/break modes.
- Persist all changes in browser localStorage.

### Data model
- Task: id, title, category, priority, effort, dueDate, notes, status, createdAt
- Habit: id, name, done
- Timer state: mode, remaining seconds, running flag

### Success criteria
- Users can add and manage tasks without leaving the page.
- The interface remains readable and usable on desktop and mobile screens.
- Input validation prevents empty or malformed tasks.
- The app feels polished, calm, and low-friction to use.

## Implementation plan
1. Build a single-page dashboard layout with a task form, stats, timer, and habit tracker.
2. Add local persistence and interactive filtering.
3. Style the app for responsive desktop/tablet/mobile usage.
4. Validate core logic with Node tests for state functions.
5. Document run steps and caveats honestly.

## How to run
1. Open a terminal in the project folder.
2. Run:
   npm test
3. To launch the page locally:
   npm start
4. Visit:
   http://localhost:4173

## Notes
This app stores demo and user-entered information in browser localStorage. It is convenient for a local prototype, but it is not secure or shared across devices. Data will persist only on the same browser profile and device.
