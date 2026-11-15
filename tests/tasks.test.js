import test from 'node:test';
import assert from 'node:assert/strict';
import { businessDay, dateInfo, prepareTasks, validDate } from '../lib/tasks.js';

const task = (id, date = null, completed = false, created = '2026-01-01', lastEdited = created) => ({ id, date, completed, created, lastEdited });

test('date validation handles leap years and rejects rollover, bad formats and zero year', () => {
  for (const date of ['2024-02-29', '2026-11-15', '0001-01-01']) assert.equal(validDate(date), true, date);
  for (const date of ['2026-02-29', '2026-02-30', '2026-13-01', '2026-1-1', '0000-01-01', 'invalid']) assert.equal(validDate(date), false, date);
});

test('today is Shanghai date across UTC midnight boundary', () => {
  assert.equal(businessDay(new Date('2026-11-14T16:00:00Z')), '2026-11-15');
  assert.equal(businessDay(new Date('2026-11-14T15:59:59Z')), '2026-11-14');
});

test('date ranges use end and timestamps use business timezone', () => {
  assert.equal(dateInfo({ start: '2026-11-01', end: '2026-11-15' }).dueDate, '2026-11-15');
  assert.equal(dateInfo({ start: '2026-11-14T20:00:00Z' }).dueDate, '2026-11-15');
  assert.equal(dateInfo({ start: '2026-11-14T20:00:00', time_zone: 'America/New_York' }).dueDate, '2026-11-15');
  assert.equal(dateInfo({ start: 'bad' }).invalidDate, true);
  assert.equal(dateInfo({ start: '2026-02-30' }).invalidDate, true);
  assert.equal(dateInfo(null).dueDate, null);
});

test('overdue only applies to open tasks before today', () => {
  const tasks = prepareTasks([task('past', { start: '2026-11-14' }), task('today', { start: '2026-11-15' }), task('done', { start: '2026-11-01' }, true), task('none')], new Date('2026-11-14T16:00:00Z'));
  assert.deepEqual(tasks.filter(t => t.overdue).map(t => t.id), ['past']);
});

test('ordering remains stable with same dates and completed edit times', () => {
  const input = [task('none'), task('z', { start: '2026-11-15' }), task('a', { start: '2026-11-15' }), task('past', { start: '2026-11-14' }), task('old', null, true), task('new', null, true, '2026-01-01', '2026-11-15')];
  assert.deepEqual(prepareTasks(input).map(t => t.id), ['past', 'a', 'z', 'none', 'new', 'old']);
  assert.deepEqual(prepareTasks([...input].reverse()).map(t => t.id), ['past', 'a', 'z', 'none', 'new', 'old']);
});
