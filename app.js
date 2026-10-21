import { DEFAULT_TASKS, DEFAULT_HABITS, filterTasks, getTaskStats, validateTask } from './logic.js';

const STORAGE_KEYS = {
  tasks: 'focusflow.tasks',
  habits: 'focusflow.habits'
};

const taskForm = document.querySelector('#task-form');
const taskList = document.querySelector('#task-list');
const habitList = document.querySelector('#habit-list');
const timerDisplay = document.querySelector('#timer-display');
const timerToggleButton = document.querySelector('#timer-toggle');
const resetDemoButton = document.querySelector('#reset-demo-data-button');
const timerResetButton = document.querySelector('#timer-reset');
const timerStatus = document.querySelector('#timer-status');
const searchInput = document.querySelector('#task-search');
const statusFilter = document.querySelector('#status-filter');
const priorityFilter = document.querySelector('#priority-filter');
const taskTitleInput = document.querySelector('#task-title');
const taskCategoryInput = document.querySelector('#task-category');
const taskPriorityInput = document.querySelector('#task-priority');
const taskEffortInput = document.querySelector('#task-effort');
const taskDueInput = document.querySelector('#task-due');
const taskNotesInput = document.querySelector('#task-notes');

const state = {
  tasks: loadFromStorage(STORAGE_KEYS.tasks, DEFAULT_TASKS),
  habits: loadFromStorage(STORAGE_KEYS.habits, DEFAULT_HABITS),
  filters: {
    query: '',
    status: 'all',
    priority: 'all'
  },
  timer: {
    mode: 'work',
    secondsLeft: 25 * 60,
    isRunning: false,
    intervalId: null
  }
};

initializeApp();

function initializeApp() {
  hydrateDefaultFormValues();
  bindEvents();
  renderAll();
  updateTimerDisplay();
}

function bindEvents() {
  taskForm.addEventListener('submit', handleTaskSubmit);
  searchInput.addEventListener('input', (event) => {
    state.filters.query = event.target.value.trim();
    renderTaskList();
  });
  statusFilter.addEventListener('change', (event) => {
    state.filters.status = event.target.value;
    renderTaskList();
  });
  priorityFilter.addEventListener('change', (event) => {
    state.filters.priority = event.target.value;
    renderTaskList();
  });

  timerToggleButton.addEventListener('click', toggleTimer);
  timerResetButton.addEventListener('click', resetTimer);
  document.querySelectorAll('.mode-button').forEach((button) => {
    button.addEventListener('click', () => {
      const mode = button.dataset.mode;
      state.timer.mode = mode;
      const isWork = mode === 'work';
      state.timer.secondsLeft = isWork ? 25 * 60 : 5 * 60;
      state.timer.isRunning = false;
      if (state.timer.intervalId) {
        clearInterval(state.timer.intervalId);
        state.timer.intervalId = null;
      }
      updateTimerDisplay();
      document.querySelectorAll('.mode-button').forEach((element) => {
        element.classList.toggle('active', element.dataset.mode === mode);
      });
      timerToggleButton.textContent = 'Start';
      timerStatus.textContent = isWork ? 'A 25-minute session is ready.' : 'A quick break timer is ready.';
    });
  });

  document.addEventListener('click', (event) => {
    const taskToggle = event.target.closest('[data-task-action="status"]');
    if (taskToggle) {
      const taskId = taskToggle.dataset.taskId;
      updateTaskStatus(taskId, taskToggle.dataset.nextStatus);
      return;
    }

    const taskDelete = event.target.closest('[data-task-action="delete"]');
    if (taskDelete) {
      deleteTask(taskDelete.dataset.taskId);
    }

    const habitToggle = event.target.closest('[data-habit-toggle]');
    if (habitToggle) {
      toggleHabit(habitToggle.dataset.habitId);
    }
  });

  resetDemoButton.addEventListener('click', () => {
    state.tasks = [...DEFAULT_TASKS];
    state.habits = [...DEFAULT_HABITS];
    saveToStorage(STORAGE_KEYS.tasks, state.tasks);
    saveToStorage(STORAGE_KEYS.habits, state.habits);
    renderAll();
  });
}

function hydrateDefaultFormValues() {
  const today = new Date();
  const defaultDate = new Date(today.getTime() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  taskDueInput.value = defaultDate;
}

function handleTaskSubmit(event) {
  event.preventDefault();

  const formData = {
    title: taskTitleInput.value.trim(),
    category: taskCategoryInput.value,
    priority: taskPriorityInput.value,
    effort: taskEffortInput.value,
    dueDate: taskDueInput.value,
    notes: taskNotesInput.value.trim()
  };

  const validation = validateTask(formData);
  clearFieldErrors();

  if (Object.keys(validation).length > 0) {
    Object.entries(validation).forEach(([field, message]) => {
      const errorNode = document.querySelector(`#${field}-error`);
      if (errorNode) {
        errorNode.textContent = message;
      }
    });
    return;
  }

  const newTask = {
    id: crypto.randomUUID(),
    title: formData.title,
    category: formData.category,
    priority: formData.priority,
    effort: formData.effort,
    dueDate: formData.dueDate,
    notes: formData.notes || 'No additional notes',
    status: 'todo',
    createdAt: new Date().toISOString()
  };

  state.tasks = [newTask, ...state.tasks];
  saveToStorage(STORAGE_KEYS.tasks, state.tasks);
  taskForm.reset();
  hydrateDefaultFormValues();
  renderAll();
}

function renderAll() {
  renderStats();
  renderTaskList();
  renderHabitList();
}

function renderStats() {
  const stats = getTaskStats(state.tasks);
  document.querySelector('#stat-completed').textContent = String(stats.completed);
  document.querySelector('#stat-progress').textContent = String(stats.inProgress);
  document.querySelector('#stat-priority').textContent = String(stats.highPriority);
  document.querySelector('#stat-streak').textContent = `${stats.streak} days`;
}

function renderTaskList() {
  const filteredTasks = filterTasks(state.tasks, state.filters.query, state.filters.status, state.filters.priority);

  if (filteredTasks.length === 0) {
    taskList.innerHTML = `
      <li class="empty-state">
        No tasks match your filters yet. Try adjusting the search or add a new task.
      </li>
    `;
    return;
  }

  taskList.innerHTML = filteredTasks
    .map((task) => {
      const nextStatus = task.status === 'todo' ? 'doing' : task.status === 'doing' ? 'done' : 'todo';
      const statusLabel = { todo: 'To do', doing: 'In progress', done: 'Done' }[task.status];
      const completeText = task.status === 'done' ? 'Mark as to do' : task.status === 'doing' ? 'Mark as done' : 'Start task';

      return `
        <li class="task-item">
          <div class="task-main">
            <div class="task-title-row">
              <span class="task-title">${escapeHtml(task.title)}</span>
              <span class="badge ${task.category.toLowerCase()}">${task.category}</span>
              <span class="badge ${task.priority.toLowerCase()}">${task.priority}</span>
            </div>
            <div class="task-meta">
              <span><strong>Effort:</strong> ${task.effort}</span>
              <span><strong>Due:</strong> ${task.dueDate ? formatDate(task.dueDate) : 'No due date'}</span>
              <span><strong>Status:</strong> ${statusLabel}</span>
            </div>
            ${task.notes ? `<p class="helper-text">${escapeHtml(task.notes)}</p>` : ''}
          </div>
          <div class="task-actions">
            <button class="status-toggle" data-task-action="status" data-task-id="${task.id}" data-next-status="${nextStatus}" type="button" aria-label="Update status for ${escapeAttribute(task.title)}">${completeText}</button>
            <button class="delete-button" data-task-action="delete" data-task-id="${task.id}" type="button" aria-label="Delete ${escapeAttribute(task.title)}">Delete</button>
          </div>
        </li>
      `;
    })
    .join('');
}

function renderHabitList() {
  habitList.innerHTML = state.habits
    .map((habit) => {
      const toggleLabel = habit.done ? 'Done' : 'Mark done';
      return `
        <div class="habit-item">
          <div class="habit-copy">
            <span class="habit-name">${escapeHtml(habit.name)}</span>
          </div>
          <button class="habit-toggle ${habit.done ? 'active' : ''}" type="button" data-habit-toggle data-habit-id="${habit.id}">${toggleLabel}</button>
        </div>
      `;
    })
    .join('');
}

function updateTaskStatus(taskId, nextStatus) {
  state.tasks = state.tasks.map((task) => {
    if (task.id === taskId) {
      return { ...task, status: nextStatus };
    }
    return task;
  });
  saveToStorage(STORAGE_KEYS.tasks, state.tasks);
  renderAll();
}

function deleteTask(taskId) {
  state.tasks = state.tasks.filter((task) => task.id !== taskId);
  saveToStorage(STORAGE_KEYS.tasks, state.tasks);
  renderAll();
}

function toggleHabit(habitId) {
  state.habits = state.habits.map((habit) => {
    if (habit.id === habitId) {
      return { ...habit, done: !habit.done };
    }
    return habit;
  });
  saveToStorage(STORAGE_KEYS.habits, state.habits);
  renderHabitList();
}

function clearFieldErrors() {
  document.querySelectorAll('.error-message').forEach((element) => {
    element.textContent = '';
  });
}

function toggleTimer() {
  if (state.timer.isRunning) {
    clearInterval(state.timer.intervalId);
    state.timer.intervalId = null;
    state.timer.isRunning = false;
    timerToggleButton.textContent = 'Resume';
    timerStatus.textContent = `${formatClock(state.timer.secondsLeft)} left in this ${state.timer.mode} session.`;
    return;
  }

  state.timer.isRunning = true;
  timerToggleButton.textContent = 'Pause';
  timerStatus.textContent = `${state.timer.mode === 'work' ? 'Deep work' : 'Recharge'} in progress.`;

  state.timer.intervalId = setInterval(() => {
    state.timer.secondsLeft -= 1;
    if (state.timer.secondsLeft <= 0) {
      clearInterval(state.timer.intervalId);
      state.timer.intervalId = null;
      state.timer.isRunning = false;
      timerToggleButton.textContent = 'Start';
      const nextMode = state.timer.mode === 'work' ? 'break' : 'work';
      state.timer.mode = nextMode;
      document.querySelectorAll('.mode-button').forEach((button) => {
        button.classList.toggle('active', button.dataset.mode === nextMode);
      });
      state.timer.secondsLeft = nextMode === 'work' ? 25 * 60 : 5 * 60;
      timerStatus.textContent = nextMode === 'work' ? 'Session complete. Time to focus again.' : 'Break complete. Ready for your next sprint.';
      updateTimerDisplay();
      return;
    }
    updateTimerDisplay();
  }, 1000);
}

function resetTimer() {
  if (state.timer.intervalId) {
    clearInterval(state.timer.intervalId);
    state.timer.intervalId = null;
  }
  state.timer.isRunning = false;
  state.timer.secondsLeft = state.timer.mode === 'work' ? 25 * 60 : 5 * 60;
  timerToggleButton.textContent = 'Start';
  timerStatus.textContent = state.timer.mode === 'work' ? 'A 25-minute session is ready.' : 'A quick break timer is ready.';
  updateTimerDisplay();
}

function updateTimerDisplay() {
  timerDisplay.textContent = formatClock(state.timer.secondsLeft);
}

function formatClock(totalSeconds) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

function formatDate(dateString) {
  const date = new Date(`${dateString}T12:00:00`);
  return new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric' }).format(date);
}

function saveToStorage(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function loadFromStorage(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function escapeAttribute(value) {
  return escapeHtml(value).replace(/`/g, '&#96;');
}
