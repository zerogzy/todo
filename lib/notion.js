import 'server-only';
import { Client } from '@notionhq/client';
import { NOTION_OPTIONS, readConfig } from './notion-config.js';

export function getNotion({ retry = NOTION_OPTIONS.retry } = {}) {
  const { token, dataSourceId } = readConfig(process.env);
  return { notion: new Client({ ...NOTION_OPTIONS, auth: token, retry }), dataSourceId };
}
