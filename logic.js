export const DEFAULT_TASKS = [
  {
    id: 'task-1',
    title: 'Prepare chemistry revision notes',
    category: 'Study',
    priority: 'High',
    effort: '45 min',
    dueDate: dateOffset(1),
    notes: 'Create a one-page summary and 5 practice questions.',
    status: 'doing'
  },
  {
    id: 'task-2',
    title: 'Finish portfolio homepage copy',
    category: 'Work',
    priority: 'Medium',
    effort: '1 hour',
    dueDate: dateOffset(3),
    notes: 'Review CTA language and homepage features.',
    status: 'todo'
  },
  {
    id: 'task-3',
    title: 'Evening walk + stretch routine',
    category: 'Wellbeing',
    priority: 'Low',
    effort: '30 min',
    dueDate: dateOffset(0),
    notes: 'Keep it light and consistent.',
    status: 'done'
  }
];

export const DEFAULT_HABITS = [
  { id: 'habit-1', name: 'Read 20 pages', done: true },
  { id: 'habit-2', name: 'Drink water', done: false },
  { id: 'habit-3', name: '10-minute review', done: true }
];

export function validateTask(task) {
  const errors = {};

  if (!task.title || !task.title.trim()) {
    errors.title = 'Title is required.';
  } else if (task.title.trim().length < 3) {
    errors.title = 'Title must be at least 3 characters.';
  }

  if (!task.category) {
    errors.category = 'Select a category.';
  }

  if (!task.priority) {
    errors.priority = 'Select a priority level.';
  }

  if (!task.effort) {
    errors.effort = 'Select an effort estimate.';
  }

  if (task.dueDate && Number.isNaN(new Date(task.dueDate).getTime())) {
    errors.dueDate = 'Use a valid date.';
  }

  return errors;
}

export function filterTasks(tasks, query, status, priority) {
  const normalizedQuery = query.toLowerCase().trim();

  return tasks.filter((task) => {
    const matchesQuery = !normalizedQuery ||
      task.title.toLowerCase().includes(normalizedQuery) ||
      task.notes.toLowerCase().includes(normalizedQuery) ||
      task.category.toLowerCase().includes(normalizedQuery);

    const matchesStatus = status === 'all' || task.status === status;
    const matchesPriority = priority === 'all' || task.priority === priority;

    return matchesQuery && matchesStatus && matchesPriority;
  });
}

export function getTaskStats(tasks) {
  const completed = tasks.filter((task) => task.status === 'done').length;
  const inProgress = tasks.filter((task) => task.status === 'doing').length;
  const highPriority = tasks.filter((task) => task.priority === 'High').length;
  const streak = Math.min(5, Math.max(1, completed + 2));

  return { completed, inProgress, highPriority, streak };
}

function dateOffset(days) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
}
