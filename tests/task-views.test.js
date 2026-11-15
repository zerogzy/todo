import test from 'node:test';
import assert from 'node:assert/strict';
import { taskView, tasksInView } from '../lib/task-views.js';
import { databaseLink } from '../lib/notion-tasks.js';

test('view inputs default safely and separate task collections without changing draft data', () => {
  for (const input of [null, undefined, '', 'wrong', ['completed']]) assert.equal(taskView(input), 'open');
  const tasks = [{ id: 'a', completed: false }, { id: 'b', completed: true }];
  assert.deepEqual(tasksInView(tasks, taskView('open')), [tasks[0]]);
  assert.deepEqual(tasksInView(tasks, taskView('completed')), [tasks[1]]);
  assert.deepEqual(tasksInView(tasks, taskView('trash')), []);
  assert.equal(tasks.length, 2);
});

test('trash management uses retrieved database HTTPS URL and makes no writes', async () => {
  const calls = [];
  const notion = { databases: { retrieve: async args => { calls.push(args); return { url: 'https://www.notion.so/database' }; } } };
  assert.equal(await databaseLink(notion, { parent: { database_id: 'db' } }), 'https://www.notion.so/database');
  assert.deepEqual(calls, [{ database_id: 'db' }]);
  await assert.rejects(databaseLink(notion, {}));
  for (const url of ['javascript:alert(1)', 'http://notion.so/db', 'https://user:secret@notion.so/db', 'bad']) {
    notion.databases.retrieve = async () => ({ url });
    await assert.rejects(databaseLink(notion, { parent: { database_id: 'db' } }));
  }
});
