'use client';

import { useEffect, useRef, useState } from 'react';
import { tasksInView } from '../../lib/task-views.js';
import TaskList from './task-list.js';
import Refresh from './refresh.js';

export default function TaskBoard({ tasks, error, view, navigate }) {
  const [result, setResult] = useState({});
  const feedback = useRef(null);
  const focusedResult = useRef(null);
  useEffect(() => {
    if (!result.saved || focusedResult.current === result) return;
    const task = tasks.find(task => task.id === result.taskId);
    if (error || task?.completed === result.completed) {
      feedback.current?.focus();
      focusedResult.current = result;
    }
  }, [tasks, result, error]);
  const visible = tasksInView(tasks, view);
  const destination = result.completed ? 'completed' : 'open';
  return <>
    <p role="status" ref={feedback} tabIndex={-1}>{result.saved && error ? '已保存，列表刷新失败，请刷新检查。' : result.message}
      {result.saved && !error && <> <a href={`?view=${destination}`} onClick={event => navigate(event, destination)}>查看{result.completed ? '已完成' : '待完成'}</a></>}
    </p>
    {error ? <section aria-label="读取错误"><p role="alert">{error}</p><Refresh retry /></section> : <section aria-label={view === 'completed' ? '已完成任务' : '待完成任务'}>
      {visible.length ? <TaskList tasks={visible} onResult={setResult} /> : <p className="empty-state">{view === 'completed' ? '暂无已完成任务。' : tasks.length ? '暂无待完成任务。' : '暂无任务。'}</p>}
    </section>}
  </>;
}
