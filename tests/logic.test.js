import test from 'node:test';
import assert from 'node:assert/strict';
import { DEFAULT_TASKS, DEFAULT_HABITS, filterTasks, getTaskStats, validateTask } from '../logic.js';

test('validateTask returns an error when title is empty', () => {
  const result = validateTask({ title: '', category: 'Study', priority: 'High', effort: '30 min', dueDate: '2026-10-30', notes: '' });
  assert.equal(result.title, 'Title is required.');
});

test('validateTask accepts a valid task object', () => {
  const result = validateTask({ title: 'Read chapter 3', category: 'Study', priority: 'Medium', effort: '30 min', dueDate: '2026-10-30', notes: 'Review summary' });
  assert.deepEqual(result, {});
});

test('filterTasks matches search text and status filters', () => {
  const tasks = [
    { title: 'Write essay', category: 'Study', priority: 'High', status: 'todo', notes: 'Draft intro' },
    { title: 'Plan sprint', category: 'Work', priority: 'Medium', status: 'doing', notes: 'Prep backlog' },
    { title: 'Stretch routine', category: 'Wellbeing', priority: 'Low', status: 'done', notes: 'Mobility' }
  ];

  const result = filterTasks(tasks, 'essay', 'todo', 'High');
  assert.equal(result.length, 1);
  assert.equal(result[0].title, 'Write essay');
});

test('getTaskStats summarizes tasks correctly', () => {
  const stats = getTaskStats([
    { status: 'done', priority: 'High' },
    { status: 'done', priority: 'High' },
    { status: 'doing', priority: 'Medium' },
    { status: 'todo', priority: 'Low' }
  ]);

  assert.equal(stats.completed, 2);
  assert.equal(stats.inProgress, 1);
  assert.equal(stats.highPriority, 2);
  assert.ok(stats.streak >= 1);
});

test('default demo data is present', () => {
  assert.ok(DEFAULT_TASKS.length >= 3);
  assert.ok(DEFAULT_HABITS.length >= 3);
});
