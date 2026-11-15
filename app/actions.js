'use server';

import { revalidatePath } from 'next/cache';
import { getNotion } from '../lib/notion.js';
import { createTask, setTaskCompleted } from '../lib/notion-tasks.js';
import { safeError, UserError } from '../lib/notion-config.js';
import { validateTaskInput } from '../lib/tasks.js';

export async function toggleTask(previous, form) {
  const target = form.get('completed');
  if (target !== 'true' && target !== 'false') return { error: '完成状态无效，请刷新列表。' };
  try {
    const { notion, dataSourceId } = getNotion();
    await setTaskCompleted(notion, dataSourceId, form.get('id'), target === 'true');
  } catch (error) { return { error: safeError(error) }; }
  try { revalidatePath('/'); } catch { return { saved: true, message: '已保存，列表刷新失败，请刷新检查。' }; }
  return { saved: true, message: target === 'true' ? '任务已完成。' : '任务已恢复为未完成。' };
}

export async function addTask(previous, form) {
  const input = { title: form.get('title'), date: form.get('date'), notes: form.get('notes'), priority: form.get('priority') ?? undefined };
  const { errors } = validateTaskInput(input);
  if (Object.keys(errors).length) return { errors };
  try {
    const { notion, dataSourceId } = getNotion({ retry: false });
    await createTask(notion, dataSourceId, input);
  } catch (error) {
    const rejected = error instanceof UserError || (error.status >= 400 && error.status < 500);
    return { error: rejected ? safeError(error) : '结果未确认，请刷新检查，避免重复新增。' };
  }
  try { revalidatePath('/'); } catch { return { saved: true, message: '已保存，列表刷新失败，请刷新检查。' }; }
  return { saved: true, message: '任务已新增。' };
}
