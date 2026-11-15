import test from 'node:test';
import assert from 'node:assert/strict';
import { createTask } from '../lib/notion-tasks.js';
import { validateTaskInput } from '../lib/tasks.js';
import { dataSourceId, schemaFixture, mockNotion } from './fixtures.js';

test('invalid task inputs cause no requests', async () => {
  const { notion, calls } = mockNotion(() => { throw Error('no network'); });
  for (const input of [
    { title: ' ', date: '', notes: '' },
    { title: '😀'.repeat(101), date: '', notes: '' },
    { title: 'a', date: '2026-02-30', notes: '' },
    { title: 'a', date: '', notes: 'x'.repeat(2001) },
    { title: new Blob(['x']), date: '', notes: '' },
    { title: 'a', date: new Blob(), notes: '' },
  ]) assert.ok(Object.keys((await createTask(notion, dataSourceId, input)).errors).length);
  assert.equal(calls.length, 0);
  assert.deepEqual(validateTaskInput({ title: '  a ', date: '2028-02-29', notes: '' }).values, { title: 'a', date: '2028-02-29', notes: '', priority: '中' });
});

test('create uses fixed source and expected writable properties', async () => {
  const { notion, calls } = mockNotion(call => call.method === 'GET' ? schemaFixture() : { id: 'new-id' });
  assert.deepEqual(await createTask(notion, dataSourceId, { title: '  task ', date: '2028-02-29', notes: 'note' }), { id: 'new-id' });
  assert.deepEqual(calls[1].body, {
    parent: { type: 'data_source_id', data_source_id: dataSourceId },
    properties: { '任务': { title: [{ text: { content: 'task' } }] }, '完成': { checkbox: false }, '优先级': { select: { name: '中' } }, '完成时间': { date: null }, '截止日期': { date: { start: '2028-02-29' } }, '备注': { rich_text: [{ text: { content: 'note' } }] } },
  });
  await createTask(notion, dataSourceId, { title: 'task', date: '', notes: '' });
  assert.equal(calls[3].body.properties['截止日期'].date, null);
  assert.deepEqual(calls[3].body.properties['备注'].rich_text, []);
});

test('create timeout is sent only once with retry disabled', async () => {
  const { notion, calls } = mockNotion(call => {
    if (call.method === 'GET') return schemaFixture();
    throw new Error('simulated lost response');
  });
  await assert.rejects(createTask(notion, dataSourceId, { title: 'task', date: '', notes: '' }));
  assert.equal(calls.filter(call => call.method === 'POST').length, 1);
});
