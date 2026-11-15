import { Client } from '@notionhq/client';
import { NOTION_OPTIONS, PRIORITIES, UserError, readConfig, safeError, validateSchema } from '../lib/notion-config.js';

// Explicit setup only: ordinary reads and the connection check never change schema.
try {
  const { token, dataSourceId } = readConfig(process.env);
  const notion = new Client({ ...NOTION_OPTIONS, auth: token, retry: false });
  const source = await notion.dataSources.retrieve({ data_source_id: dataSourceId });
  const additions = { '任务编号': { type: 'unique_id', unique_id: { prefix: null } }, '优先级': { type: 'select', select: { options: PRIORITIES.map(name => ({ name })) } }, '完成时间': { type: 'date', date: {} } };
  const properties = {};
  for (const [name, definition] of Object.entries(additions)) {
    const existing = source.properties[name];
    if (!existing) properties[name] = definition;
    else if (existing.type !== definition.type) throw new UserError(`Notion 属性“${name}”类型冲突，请先检查配置。`);
  }
  if (source.properties['任务编号']?.unique_id?.prefix) throw new UserError('已有任务编号带前缀，未修改，请先检查配置。');
  if (!source.properties['任务编号'] && Object.values(source.properties).some(property => property.type === 'unique_id')) throw new UserError('数据源已有其他编号属性，未创建重复编号，请先检查配置。');
  const options = source.properties['优先级']?.select?.options;
  if (options && PRIORITIES.some(name => !options.some(option => option.name === name))) {
    properties['优先级'] = { type: 'select', select: { options: [...options.map(({ id, name, color }) => ({ id, name, color })), ...PRIORITIES.filter(name => !options.some(option => option.name === name)).map(name => ({ name }))] } };
  }
  // Validate original fields before any mutation as well as the prospective additions.
  validateSchema({ ...source, properties: { ...source.properties, ...properties } });
  if (Object.keys(properties).length) await notion.dataSources.update({ data_source_id: dataSourceId, properties });
  validateSchema(await notion.dataSources.retrieve({ data_source_id: dataSourceId }));
  console.log('Notion 七个任务属性已就绪；未改写已有任务内容。');
} catch (error) {
  console.error(safeError(error));
  process.exitCode = 1;
}
