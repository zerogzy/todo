import { UserError, validateSchema, validId, normalizeId } from './notion-config.js';
import { validateTaskInput } from './tasks.js';

async function writablePage(notion, dataSourceId, pageId) {
  if (!validId(pageId)) throw new UserError('任务 ID 无效，请刷新列表。');
  const page = await notion.pages.retrieve({ page_id: pageId });
  if (page.parent?.type !== 'data_source_id' || normalizeId(page.parent.data_source_id) !== normalizeId(dataSourceId)) throw new UserError('该任务不属于配置的数据源。');
  if (page.in_trash || page.archived) throw new UserError('任务已在回收站，请刷新列表。');
  validateSchema(await notion.dataSources.retrieve({ data_source_id: dataSourceId }));
  return page;
}

export async function setTaskCompleted(notion, dataSourceId, pageId, completed) {
  if (typeof completed !== 'boolean') throw new UserError('完成状态无效，请刷新列表。');
  const page = await writablePage(notion, dataSourceId, pageId);
  if (completed && page.properties['完成'].checkbox) return;
  await notion.pages.update({ page_id: pageId, properties: {
    '完成': { checkbox: completed },
    '完成时间': { date: completed ? { start: new Date().toISOString() } : null },
  } });
}

export async function trashTask(notion, dataSourceId, pageId) {
  await writablePage(notion, dataSourceId, pageId);
  await notion.pages.update({ page_id: pageId, in_trash: true });
}

export async function createTask(notion, dataSourceId, input) {
  const { values, errors } = validateTaskInput(input);
  if (Object.keys(errors).length) return { errors };
  validateSchema(await notion.dataSources.retrieve({ data_source_id: dataSourceId }));
  const page = await notion.pages.create({
    parent: { type: 'data_source_id', data_source_id: dataSourceId },
    properties: {
      '任务': { title: [{ text: { content: values.title } }] },
      '完成': { checkbox: false },
      '优先级': { select: { name: values.priority } },
      '完成时间': { date: null },
      '截止日期': { date: values.date ? { start: values.date } : null },
      '备注': { rich_text: values.notes ? [{ text: { content: values.notes } }] : [] },
    },
  });
  return { id: page.id };
}

function plainText(parts) {
  return parts?.map(part => part.plain_text ?? part.text?.content ?? '').join('') || '';
}

export function mapTask(page) {
  const properties = page.properties;
  if (!properties || properties['任务']?.type !== 'title' || properties['完成']?.type !== 'checkbox' || properties['截止日期']?.type !== 'date' || properties['备注']?.type !== 'rich_text' || properties['任务编号']?.type !== 'unique_id' || properties['优先级']?.type !== 'select' || properties['完成时间']?.type !== 'date') {
    throw new UserError('Notion 任务属性不完整，请检查数据源及集成权限。');
  }
  const url = new URL(page.url);
  if (url.protocol !== 'https:') throw new UserError('Notion 任务链接无效。');
  return {
    id: page.id,
    title: plainText(properties['任务'].title).trim() || '未命名任务',
    completed: properties['完成'].checkbox,
    number: properties['任务编号'].unique_id?.number,
    priority: properties['优先级'].select?.name ?? '中',
    completedAt: properties['完成时间'].date?.start ?? null,
    date: properties['截止日期'].date,
    notes: plainText(properties['备注'].rich_text),
    created: page.created_time,
    lastEdited: page.last_edited_time,
    url: url.href,
  };
}

export async function listTasks(notion, dataSourceId, source) {
  validateSchema(source ?? await notion.dataSources.retrieve({ data_source_id: dataSourceId }));
  const tasks = [];
  let cursor;
  do {
    const response = await notion.dataSources.query({ data_source_id: dataSourceId, page_size: 100, start_cursor: cursor, sorts: [{ timestamp: 'created_time', direction: 'ascending' }] });
    // shortcut: capped queries are rejected; add partitioned reads when the task source exceeds the API query limit.
    if (response.request_status?.type === 'incomplete') throw new UserError('Notion 查询结果超过上限，任务未完整读取，请在 Notion 缩小数据源。');
    for (const page of response.results) {
      if (!page.in_trash && !page.archived) tasks.push(mapTask(page));
    }
    if (response.has_more && (!response.next_cursor || response.next_cursor === cursor)) throw new UserError('Notion 分页异常，任务未完整读取，请重试。');
    cursor = response.has_more ? response.next_cursor : null;
  } while (cursor);
  return tasks;
}

export async function databaseLink(notion, source) {
  const databaseId = source.parent?.database_id;
  if (!databaseId) throw new UserError('无法取得数据库链接，请重试。');
  const database = await notion.databases.retrieve({ database_id: databaseId });
  const url = new URL(database.url);
  if (url.protocol !== 'https:' || url.username || url.password) throw new UserError('数据库链接无效，请在 Notion 中打开。');
  return url.href;
}
