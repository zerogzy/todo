import { Client } from '@notionhq/client';
import { NOTION_OPTIONS } from '../lib/notion-config.js';

export const dataSourceId = '11111111-1111-1111-1111-111111111111';

export function schemaFixture() {
  return { id: dataSourceId, properties: { '任务': { type: 'title' }, '完成': { type: 'checkbox' }, '截止日期': { type: 'date' }, '备注': { type: 'rich_text' }, '任务编号': { type: 'unique_id', unique_id: { prefix: null } }, '优先级': { type: 'select', select: { options: ['高','中','低'].map(name => ({ name })) } }, '完成时间': { type: 'date' } } };
}

export function pageFixture({ id = '22222222-2222-2222-2222-222222222222', title = '示例任务', completed = false, date = null, notes = '', inTrash = false, created = '2026-01-01T00:00:00Z', lastEdited = created } = {}) {
  return {
    object: 'page', id, url: `https://www.notion.so/${id.replaceAll('-', '')}`, in_trash: inTrash,
    parent: { type: 'data_source_id', data_source_id: dataSourceId },
    created_time: created, last_edited_time: lastEdited,
    properties: {
      '任务': { type: 'title', title: [{ plain_text: title }] },
      '完成': { type: 'checkbox', checkbox: completed },
      '任务编号': { type: 'unique_id', unique_id: { prefix: null, number: 1 } },
      '优先级': { type: 'select', select: { name: '中' } },
      '完成时间': { type: 'date', date: null },
      '截止日期': { type: 'date', date },
      '备注': { type: 'rich_text', rich_text: [{ plain_text: notes }] },
    },
  };
}

export function mockNotion(respond) {
  const calls = [];
  const notion = new Client({ ...NOTION_OPTIONS, auth: 'test-token', retry: false, fetch: async (url, options) => {
    const call = { path: new URL(url).pathname, method: options.method, body: options.body ? JSON.parse(options.body) : undefined };
    calls.push(call);
    const result = await respond(call);
    return result instanceof Response ? result : Response.json(result);
  } });
  return { notion, calls };
}
