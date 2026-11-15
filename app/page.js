import { getNotion } from '../lib/notion.js';
import { listTasks, databaseLink } from '../lib/notion-tasks.js';
import { safeError } from '../lib/notion-config.js';
import { prepareTasks } from '../lib/tasks.js';
import TodoShell from './components/todo-shell.js';
import { taskView } from '../lib/task-views.js';

export const dynamic = 'force-dynamic';
export const maxDuration = 300;

export default async function Home({ searchParams }) {
  let tasks = [];
  let error;
  let databaseUrl;
  try {
    const { notion, dataSourceId } = getNotion();
    const source = await notion.dataSources.retrieve({ data_source_id: dataSourceId });
    tasks = prepareTasks(await listTasks(notion, dataSourceId, source));
    try { databaseUrl = await databaseLink(notion, source); } catch { /* The trash view keeps recovery instructions and retry. */ }
  } catch (cause) {
    error = safeError(cause);
  }
  return <TodoShell tasks={tasks} error={error} databaseUrl={databaseUrl} initialView={taskView((await searchParams).view)} />;
}
