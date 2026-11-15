'use client';

import { useActionState } from 'react';
import { toggleTask } from '../actions.js';
import { PRIORITIES } from '../../lib/notion-config.js';

const completionFormatter = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Shanghai', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' });
function completionLabel(value) {
  if (!value) return '已完成 · 时间未记录';
  const date = new Date(value);
  if (!Number.isFinite(date.getTime()) || !value.includes('T')) return '已完成 · 时间异常';
  const parts = completionFormatter.formatToParts(date);
  const part = type => parts.find(item => item.type === type).value;
  return `于${part('year')}/${part('month')}/${part('day')} ${part('hour')}:${part('minute')}完成`;
}

function TaskRow({ task, onResult }) {
  const [result, action, pending] = useActionState(async (previous, form) => {
    const next = await toggleTask(previous, form);
    onResult({ ...next, taskId: task.id, completed: !task.completed });
    return next;
  }, {});
  return <tr className={task.overdue ? 'overdue' : undefined} aria-busy={pending}>
    <td className="number-cell">{Number.isInteger(task.number) ? task.number : '—'}</td>
    <td className="date-cell"><span>{task.dateLabel ? task.dateLabel.replaceAll('-', '/') : '—'}</span>{task.overdue && <strong>已逾期</strong>}</td>
    <td className="task-content"><a href={task.url} target="_blank" rel="noopener noreferrer">{task.title}</a>{task.notes && <p className="task-notes">{task.notes}</p>}</td>
    <td className="priority-cell">{PRIORITIES.includes(task.priority) ? task.priority : '未设置'}</td>
    <td className="status-cell">
      {task.completed && <p className="completion-time">{completionLabel(task.completedAt)}</p>}
      <form action={action} className="completion-form">
        <input type="hidden" name="id" value={task.id} />
        <input type="hidden" name="completed" value={String(!task.completed)} />
        {task.completed ? <button className="restore-button" type="submit" disabled={pending} aria-label={`恢复未完成：${task.title}`}>恢复未完成</button> : <label><input type="checkbox" checked={false} disabled={pending} onChange={event => event.currentTarget.form.requestSubmit()} aria-label={`完成：${task.title}`} /><span className="sr-only">未完成</span></label>}
      </form>
      {pending && <p role="status">保存中…</p>}
      {result.error && <p role="alert">{result.error}</p>}
    </td>
  </tr>;
}

export default function TaskList({ tasks, onResult }) {
  return <div className="table-scroll" role="region" aria-label="任务清单表格，可横向滚动" tabIndex={0}>
    <table className="task-table">
      <colgroup><col className="number-column" /><col className="date-column" /><col className="content-column" /><col className="priority-column" /><col className="status-column" /></colgroup>
      <thead><tr>{['#', '截止日期', '活动 / 计划 / 任务', '优先级', '完成情况'].map(label => <th scope="col" key={label}>{label}</th>)}</tr></thead>
      <tbody>{tasks.map(task => <TaskRow key={task.id} task={task} onResult={onResult} />)}</tbody>
    </table>
  </div>;
}
