'use client';

import { useActionState, useEffect, useRef, useState } from 'react';
import DateField from './date-field.js';
import { validDate } from '../../lib/tasks.js';
import { PRIORITIES } from '../../lib/notion-config.js';
import { addTask } from '../actions.js';

const emptyTask = { title: '', date: '', notes: '', priority: '中' };

export default function NewTask({ readError, view }) {
  const [values, setValues] = useState(emptyTask);
  const dialog = useRef(null);
  const trigger = useRef(null);
  const feedback = useRef(null);
  const [result, action, pending] = useActionState(async (previous, form) => {
    const next = await addTask(previous, form);
    if (next.saved) {
      setValues(emptyTask);
      dialog.current?.close();
      requestAnimationFrame(() => feedback.current?.focus());
    }
    return next;
  }, {});
  useEffect(() => { if (view !== 'open') dialog.current?.close(); }, [view]);
  const dateError = values.date && !validDate(values.date) ? '请输入有效的 YYYY-MM-DD 日期。' : result.errors?.date;
  return <section className="new-task" hidden={view !== 'open'} aria-label="添加任务">
    <button ref={trigger} className="primary" type="button" onClick={() => dialog.current.showModal()}>添加任务</button>
    <p role="status" tabIndex={-1} ref={feedback}>{result.saved && readError ? '已保存，列表读取失败，请重试。' : result.message}</p>
    <dialog className="create-dialog" ref={dialog} aria-labelledby="new-heading" onCancel={event => { if (pending) event.preventDefault(); }} onClose={() => { if (view === 'open') trigger.current?.focus(); }} onClick={event => { if (event.target === dialog.current && !pending) dialog.current.close(); }}>
      {view === 'open' && <>
        <div className="dialog-heading"><h2 id="new-heading">添加任务</h2><button type="button" disabled={pending} aria-label="关闭新增任务" onClick={() => dialog.current.close()}>关闭</button></div>
        <form action={action} noValidate>
          <fieldset disabled={pending}>
            <div className="field title-field">
              <label htmlFor="title">任务内容（必填，最多 200）</label>
              <input autoFocus id="title" name="title" required maxLength={200} value={values.title} onChange={event => setValues({ ...values, title: event.target.value })} aria-invalid={!!result.errors?.title} aria-describedby={result.errors?.title ? 'title-error' : undefined} />
              {result.errors?.title && <p id="title-error" role="alert">{result.errors.title}</p>}
            </div>
            <div className="field">
              <label htmlFor="date">截止日期（可选）</label>
              <DateField value={values.date} onChange={date => setValues({ ...values, date })} error={dateError} disabled={pending} />
              <p id="date-help" className="field-help">选择日期或输入 YYYY-MM-DD，可清空。</p>
              {dateError && <p id="date-error" role="alert">{dateError}</p>}
            </div>
            <div className="field">
              <label htmlFor="priority">优先级</label>
              <select id="priority" name="priority" value={values.priority} onChange={event => setValues({ ...values, priority: event.target.value })} aria-invalid={!!result.errors?.priority} aria-describedby={result.errors?.priority ? 'priority-error' : undefined}>
                {PRIORITIES.map(priority => <option key={priority}>{priority}</option>)}
              </select>
              {result.errors?.priority && <p id="priority-error" role="alert">{result.errors.priority}</p>}
            </div>
            <div className="field notes-field">
              <label htmlFor="notes">备注（可选，最多 2,000）</label>
              <textarea id="notes" name="notes" maxLength={2000} value={values.notes} onChange={event => setValues({ ...values, notes: event.target.value })} aria-invalid={!!result.errors?.notes} aria-describedby={result.errors?.notes ? 'notes-error' : undefined} />
              {result.errors?.notes && <p id="notes-error" role="alert">{result.errors.notes}</p>}
            </div>
            <div className="dialog-actions"><button type="button" onClick={() => dialog.current.close()}>取消</button><button className="primary" type="submit">{pending ? '新增中…' : '创建任务'}</button></div>
          </fieldset>
          {result.error && <p role="alert">{result.error}</p>}
        </form>
      </>}
    </dialog>
  </section>;
}
