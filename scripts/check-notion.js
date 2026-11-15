import { Client } from '@notionhq/client';
import { pathToFileURL } from 'node:url';
import { NOTION_OPTIONS, readConfig, safeError, validateSchema } from '../lib/notion-config.js';

export async function checkNotion(notion, dataSourceId) {
  validateSchema(await notion.dataSources.retrieve({ data_source_id: dataSourceId }));
  await notion.dataSources.query({ data_source_id: dataSourceId, page_size: 1 });
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    const { token, dataSourceId } = readConfig(process.env);
    await checkNotion(new Client({ ...NOTION_OPTIONS, auth: token }), dataSourceId);
    console.log('Notion 连接成功，七个任务属性检查通过（仅只读检查）。');
  } catch (error) {
    console.error(safeError(error));
    process.exitCode = 1;
  }
}
