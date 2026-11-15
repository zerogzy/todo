import test from 'node:test';
import assert from 'node:assert/strict';
import { Client } from '@notionhq/client';
import { spawnSync } from 'node:child_process';
import { NOTION_OPTIONS, readConfig, safeError, validateSchema, validId } from '../lib/notion-config.js';
import { schemaFixture } from './fixtures.js';
import { checkNotion } from '../scripts/check-notion.js';

const id = '11111111-1111-1111-1111-111111111111';
export const properties = schemaFixture().properties;

test('configuration rejects missing, placeholder and invalid values without echoing secrets', () => {
  assert.throws(() => readConfig({}), /NOTION_TOKEN/);
  assert.throws(() => readConfig({ NOTION_TOKEN: 'replace_with_token' }), /NOTION_TOKEN/);
  assert.throws(() => readConfig({ NOTION_TOKEN: 'private-token', NOTION_DATA_SOURCE_ID: 'bad' }), /NOTION_DATA_SOURCE_ID/);
  assert.deepEqual(readConfig({ NOTION_TOKEN: ' private-token ', NOTION_DATA_SOURCE_ID: id }), { token: 'private-token', dataSourceId: id });
  assert.equal(validId(id.replaceAll('-', '')), true);
  assert.equal(validId('1111-1111'), false);
});

test('all seven schema names and types are required', () => {
  validateSchema({ properties });
  for (const name of Object.keys(properties)) {
    assert.throws(() => validateSchema({ properties: { ...properties, [name]: { type: 'number' } } }), new RegExp(name));
  }
  assert.throws(() => validateSchema({ properties: {} }), /任务/);
});

test('SDK smoke check only retrieves schema and queries one row', async () => {
  const calls = [];
  const notion = new Client({ ...NOTION_OPTIONS, auth: 'test-token', fetch: async (url, options) => {
    calls.push({ url, options });
    return Response.json(url.endsWith('/query') ? { results: [], has_more: false, next_cursor: null } : { properties });
  } });
  await checkNotion(notion, id);
  assert.equal(calls.length, 2);
  assert.equal(calls[0].options.method, 'GET');
  assert.equal(calls[1].options.method, 'POST');
  assert.ok(calls.every(c => c.url.includes(`/data_sources/${id}`)));
  assert.deepEqual(JSON.parse(calls[1].options.body), { page_size: 1 });
});

test('safe errors do not echo raw SDK errors or arbitrary messages', () => {
  for (const code of ['unauthorized', 'restricted_resource', 'object_not_found', 'validation_error', 'rate_limited', 'notionhq_client_request_timeout', 'notionhq_client_fetch_error']) {
    assert.ok(!safeError({ code, message: 'private-token' }).includes('private-token'));
  }
  assert.equal(safeError(new Error('private-token')), 'Notion 暂时不可用，请稍后重试。');
  assert.equal(safeError(new Error('Notion 属性“private-token”')), 'Notion 暂时不可用，请稍后重试。');
});

test('CLI exits nonzero with no configuration and never calls live Notion', () => {
  const result = spawnSync(process.execPath, ['scripts/check-notion.js'], { env: { ...process.env, NOTION_TOKEN: '', NOTION_DATA_SOURCE_ID: '' }, encoding: 'utf8' });
  assert.equal(result.status, 1);
  assert.match(result.stderr, /NOTION_TOKEN/);
  assert.equal(result.stdout, '');
});
