import test from 'node:test';
import assert from 'node:assert/strict';
import { setTaskCompleted, trashTask } from '../lib/notion-tasks.js';
import { dataSourceId, pageFixture, schemaFixture, mockNotion } from './fixtures.js';

test('completion writes explicit target only, repeated requests never invert', async () => {
  const { notion, calls } = mockNotion(call => call.path.includes('/pages/') ? pageFixture() : schemaFixture());
  for (const target of [true, true, false]) await setTaskCompleted(notion, dataSourceId, pageFixture().id, target);
  assert.deepEqual(calls.filter(c => c.method === 'PATCH').map(c => ({ completed: c.body.properties['完成'].checkbox, hasTime: !!c.body.properties['完成时间'].date?.start })), [ { completed: true, hasTime: true }, { completed: true, hasTime: true }, { completed: false, hasTime: false } ]);
});

test('reject invalid ID, nonboolean, foreign or trashed pages without update', async () => {
  for (const page of [ { ...pageFixture(), parent: { type: 'data_source_id', data_source_id: 'different' } }, pageFixture({inTrash:true}), { ...pageFixture(), parent: {type:'page_id',page_id:dataSourceId} } ]) {
    const { notion, calls } = mockNotion(() => page);
    await assert.rejects(setTaskCompleted(notion, dataSourceId, page.id, true));
    assert.equal(calls.filter(c => c.method === 'PATCH').length, 0);
  }
  const { notion, calls } = mockNotion(() => {throw Error('unexpected');});
  await assert.rejects(setTaskCompleted(notion,dataSourceId,'bad',true));
  await assert.rejects(setTaskCompleted(notion,dataSourceId,pageFixture().id,'true'));
  assert.equal(calls.length,0);
});

test('trash only sets in_trash and refuses foreign pages', async () => {
  const {notion,calls}=mockNotion(call=>call.path.includes('/pages/')?pageFixture():schemaFixture());
  await trashTask(notion,dataSourceId,pageFixture().id);
  assert.deepEqual(calls.find(c=>c.method==='PATCH').body,{in_trash:true});
  const foreign=mockNotion(()=>({...pageFixture(),parent:{type:'data_source_id',data_source_id:'other'}}));
  await assert.rejects(trashTask(foreign.notion,dataSourceId,pageFixture().id));
  assert.equal(foreign.calls.some(c=>c.method==='PATCH'),false);
});
