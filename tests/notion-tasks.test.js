import test from 'node:test';
import assert from 'node:assert/strict';
import { listTasks, mapTask } from '../lib/notion-tasks.js';
import { dataSourceId, mockNotion, pageFixture, schemaFixture } from './fixtures.js';

test('listing reads every page, keeps completed and subtask rows, excludes trash', async () => {
  const first = pageFixture();
  const second = pageFixture({ id: '33333333-3333-3333-3333-333333333333', completed: true });
  const { notion, calls } = mockNotion(call => {
    if (call.method === 'GET') return schemaFixture();
    return call.body.start_cursor ? { results: [second], has_more: false, next_cursor: null } : { results: [first, pageFixture({ inTrash: true })], has_more: true, next_cursor: 'next' };
  });
  const tasks = await listTasks(notion, dataSourceId);
  assert.deepEqual(tasks.map(t => t.id), [first.id, second.id]);
  assert.equal(tasks[1].completed, true);
  assert.equal(calls[2].body.start_cursor, 'next');
});

test('empty title, rich text and dates retain safe display values', () => {
  const page = pageFixture({ title: '   ', notes: '<script>example</script>', date: { start: '2026-11-10', end: null } });
  page.properties['备注'].rich_text.push({ plain_text: ' 后续备注' });
  const task = mapTask(page);
  assert.equal(task.title, '未命名任务');
  assert.equal(task.notes, '<script>example</script> 后续备注');
  assert.deepEqual(task.date, { start: '2026-11-10', end: null });
  assert.ok(task.url.startsWith('https://www.notion.so/'));
});

test('malformed task attributes and unsafe URL schemes are rejected', () => {
  assert.throws(() => mapTask({ ...pageFixture(), properties: {} }), /属性不完整/);
  assert.throws(() => mapTask({ ...pageFixture(), url: 'javascript:alert(1)' }), /链接无效/);
});

test('capped or invalid pagination is not presented as complete', async () => {
  for (const response of [
    { results: [pageFixture()], has_more: false, request_status: { type: 'incomplete' } },
    { results: [], has_more: true, next_cursor: null },
  ]) {
    const { notion } = mockNotion(call => call.method === 'GET' ? schemaFixture() : response);
    await assert.rejects(() => listTasks(notion, dataSourceId), /未完整读取/);
  }
});

test('failure on a later page rejects the whole read', async () => {
  const { notion } = mockNotion(call => {
    if (call.method === 'GET') return schemaFixture();
    if (call.body.start_cursor) throw new Error('offline');
    return { results: [pageFixture()], has_more: true, next_cursor: 'next' };
  });
  await assert.rejects(() => listTasks(notion, dataSourceId));
});
