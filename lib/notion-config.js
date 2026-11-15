export const NOTION_VERSION = '2026-03-11';
export const NOTION_OPTIONS = {
  notionVersion: NOTION_VERSION,
  timeoutMs: 15_000,
  retry: { maxRetries: 2, maxRetryDelayMs: 2_000 },
  // SDK extraInfo can contain request details; only our safe error mapping is shown.
  logger: () => {},
};

export const PRIORITIES = ['高', '中', '低'];
const schema = { '任务': 'title', '完成': 'checkbox', '截止日期': 'date', '备注': 'rich_text', '任务编号': 'unique_id', '优先级': 'select', '完成时间': 'date' };

export class UserError extends Error {}

export function normalizeId(id) {
  return typeof id === 'string' ? id.replaceAll('-', '').toLowerCase() : '';
}

export function validId(id) {
  return typeof id === 'string' && /^(?:[a-f\d]{32}|[a-f\d]{8}(?:-[a-f\d]{4}){3}-[a-f\d]{12})$/i.test(id);
}

export function readConfig(env) {
  const token = env.NOTION_TOKEN?.trim();
  const dataSourceId = env.NOTION_DATA_SOURCE_ID?.trim();
  if (!token || token.startsWith('replace_with_')) throw new UserError('请在服务端 .env.local 配置 NOTION_TOKEN。');
  if (!validId(dataSourceId)) throw new UserError('请在服务端 .env.local 配置有效的 NOTION_DATA_SOURCE_ID。');
  return { token, dataSourceId };
}

export function validateSchema(dataSource) {
  for (const [name, type] of Object.entries(schema)) {
    if (dataSource.properties?.[name]?.type !== type) {
      throw new UserError(`Notion 属性“${name}”缺失或类型不匹配，需要 ${type}。`);
    }
  }
  if (dataSource.properties['任务编号'].unique_id?.prefix) throw new UserError('Notion 任务编号必须使用无前缀的纯数字编号。');
  const options = dataSource.properties['优先级'].select?.options ?? [];
  if (PRIORITIES.some(name => !options.some(option => option.name === name))) throw new UserError('Notion 优先级需要包含高、中、低三个选项。');
}

export function safeError(error) {
  if (error instanceof UserError) return error.message;
  const messages = {
    unauthorized: 'Notion Token 无效，请检查服务端配置。',
    restricted_resource: 'Notion 权限不足，请检查集成授权。',
    object_not_found: 'Notion 数据源或任务不可访问，请检查 ID 和集成授权。',
    validation_error: 'Notion 拒绝了属性或参数，请检查数据源设置。',
    rate_limited: 'Notion 请求过于频繁，请稍后重试。',
    notionhq_client_request_timeout: 'Notion 请求超时，请刷新检查后重试。',
    notionhq_client_fetch_error: '无法连接 Notion，请检查网络后重试。',
  };
  return messages[error?.code] || 'Notion 暂时不可用，请稍后重试。';
}
