import { PRIORITIES, UserError } from './notion-config.js';

const dayFormatter = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Shanghai', year: 'numeric', month: '2-digit', day: '2-digit' });

export function validateTaskInput(input) {
  const title = typeof input.title === 'string' ? input.title.trim() : '';
  const notes = typeof input.notes === 'string' ? input.notes : '';
  const date = typeof input.date === 'string' ? input.date : '';
  const priority = input.priority === undefined ? '中' : input.priority;
  const errors = {};
  if (!title || title.length > 200) errors.title = '请输入 1–200 个 UTF-16 代码单元的任务标题。';
  if (typeof input.notes !== 'string' || notes.length > 2000) errors.notes = '备注最多 2,000 个 UTF-16 代码单元。';
  if (typeof input.date !== 'string' || (date && !validDate(date))) errors.date = '请输入真实有效的 YYYY-MM-DD 日期。';
  if (!PRIORITIES.includes(priority)) errors.priority = '请选择高、中或低优先级。';
  return { values: { title, notes, date, priority }, errors };
}

export function validDate(value) {
  return typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value) && !value.startsWith('0000') &&
    Number.isFinite(Date.parse(`${value}T00:00:00Z`)) && new Date(`${value}T00:00:00Z`).toISOString().slice(0, 10) === value;
}

export function businessDay(value = new Date()) {
  const parts = dayFormatter.formatToParts(value);
  const part = type => parts.find(p => p.type === type).value;
  return `${part('year').padStart(4, '0')}-${part('month')}-${part('day')}`;
}

function dateDay(value, timeZone) {
  if (validDate(value)) return value;
  if (typeof value !== 'string' || !validDate(value.slice(0, 10)) || !value.includes('T')) return null;
  let timestamp = Date.parse(value);
  if (!/(Z|[+-]\d{2}:\d{2})$/.test(value)) {
    if (!timeZone) return null;
    const localTime = Date.parse(`${value}Z`);
    timestamp = localTime;
    const formatter = new Intl.DateTimeFormat('en-CA', { timeZone, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23' });
    for (let i = 0; i < 2; i++) {
      const parts = formatter.formatToParts(new Date(timestamp));
      const part = type => parts.find(p => p.type === type).value;
      const observed = Date.parse(`${part('year').padStart(4, '0')}-${part('month')}-${part('day')}T${part('hour')}:${part('minute')}:${part('second')}Z`) + new Date(timestamp).getUTCMilliseconds();
      timestamp += localTime - observed;
    }
  }
  return Number.isFinite(timestamp) ? businessDay(new Date(timestamp)) : null;
}

export function dateInfo(date) {
  if (!date) return { dueDate: null, dateLabel: '', invalidDate: false };
  try {
    const start = dateDay(date.start, date.time_zone);
    const end = date.end ? dateDay(date.end, date.time_zone) : null;
    if (!start || (date.end && !end)) throw new UserError('日期异常');
    return { dueDate: end || start, dateLabel: end ? `${start} 至 ${end}` : start, invalidDate: false };
  } catch {
    return { dueDate: null, dateLabel: '日期异常，请在 Notion 检查', invalidDate: true };
  }
}

export function prepareTasks(tasks, now = new Date()) {
  const today = businessDay(now);
  return tasks.map(task => {
    const info = dateInfo(task.date);
    return { ...task, ...info, overdue: !task.completed && !!info.dueDate && info.dueDate < today };
  }).sort((a, b) => {
    if (a.completed !== b.completed) return Number(a.completed) - Number(b.completed);
    if (a.completed) return b.lastEdited.localeCompare(a.lastEdited) || a.id.localeCompare(b.id);
    if (!!a.dueDate !== !!b.dueDate) return a.dueDate ? -1 : 1;
    return (a.dueDate || '').localeCompare(b.dueDate || '') || a.created.localeCompare(b.created) || a.id.localeCompare(b.id);
  });
}
