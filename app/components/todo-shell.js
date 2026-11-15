'use client';

// Layout adapted from thepuskar/todoist-clone Content.js / Sidebar.js (MIT).
import { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { taskView } from '../../lib/task-views.js';
import Refresh from './refresh.js';
import NewTask from './new-task.js';
import TaskBoard from './task-board.js';

const labels = { open: '待完成', completed: '已完成', trash: '回收站' };
function subscribeView(callback) {
  window.addEventListener('popstate', callback);
  window.addEventListener('todo-view', callback);
  return () => { window.removeEventListener('popstate', callback); window.removeEventListener('todo-view', callback); };
}
function subscribeWidth(callback) {
  const media = window.matchMedia('(max-width: 760px)');
  media.addEventListener('change', callback);
  return () => media.removeEventListener('change', callback);
}
const smallScreen = () => window.matchMedia('(max-width: 760px)').matches;

export default function TodoShell({ tasks, error, databaseUrl, initialView }) {
  const view = useSyncExternalStore(subscribeView, () => taskView(new URLSearchParams(window.location.search).get('view')), () => initialView);
  const small = useSyncExternalStore(subscribeWidth, smallScreen, () => false);
  const [expanded, setExpanded] = useState(true);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const drawer = useRef(null);
  const toggle = useRef(null);
  const heading = useRef(null);
  useEffect(() => { if (!small) drawer.current?.close(); }, [small]);
  function navigate(event, target) {
    if (event && (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button > 0)) return;
    event?.preventDefault();
    const url = new URL(window.location.href);
    url.searchParams.set('view', target);
    window.history.pushState(null, '', url);
    window.dispatchEvent(new Event('todo-view'));
    drawer.current?.close();
    requestAnimationFrame(() => heading.current?.focus());
  }
  function navigation() {
    return <nav aria-label="任务视图"><ul className="sidebar__generic">
      {Object.entries(labels).map(([key, label]) => <li key={key} className={view === key ? 'active' : undefined}>
        <a href={`?view=${key}`} aria-current={view === key ? 'page' : undefined} onClick={event => navigate(event, key)}>
          <span>{label}</span>{key !== 'trash' && !error && <span className="nav-count">{tasks.filter(task => task.completed === (key === 'completed')).length}</span>}
        </a>
      </li>)}
    </ul></nav>;
  }
  return <div className={`app-shell${expanded ? '' : ' app-shell--collapsed'}`}>
    <aside className="sidebar">
      <div className="sidebar-brand">
        <button ref={toggle} className="navigation-toggle" type="button" aria-label="切换导航" aria-expanded={small ? drawerOpen : expanded} aria-controls={small ? 'mobile-navigation' : 'desktop-navigation'} onClick={() => {
          if (small) { drawer.current.showModal(); setDrawerOpen(true); }
          else setExpanded(!expanded);
        }}><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><path d="M4 6h16M4 12h16M4 18h16" /></svg></button>
        <h1>todo</h1>
      </div>
      <div id="desktop-navigation" className="desktop-sidebar" inert={!expanded}>{navigation()}</div>
    </aside>
    <dialog id="mobile-navigation" className="navigation-drawer" ref={drawer} aria-label="任务导航" onClick={event => { if (event.target === drawer.current) drawer.current.close(); }} onClose={() => { setDrawerOpen(false); toggle.current?.focus(); }}>
      <div className="drawer-inner"><button type="button" autoFocus onClick={() => drawer.current.close()}>关闭导航</button>{navigation()}</div>
    </dialog>
    <main className="tasks">
      <div className="tasks-inner">
        <div className="view-heading"><h2 id="view-heading" tabIndex={-1} ref={heading}>{labels[view]}</h2>{view !== 'trash' && !error && <span>{tasks.filter(task => task.completed === (view === 'completed')).length} 项任务</span>}</div>
        <NewTask readError={!!error} view={view} />
        <div hidden={view === 'trash'}><TaskBoard tasks={tasks} error={error} view={view} navigate={navigate} /></div>
        {view === 'trash' && <section className="trash-info" aria-label="Notion 回收站管理">
          <h3>在 Notion 中管理回收站</h3>
          <p>已删除的任务保留在 Notion 回收站，可在那里查看和恢复。</p>
          {databaseUrl ? <a className="notion-link" href={databaseUrl} target="_blank" rel="noopener noreferrer">打开 Notion 数据库</a> : <><p role="alert">暂时无法取得数据库链接，请重试，或直接进入 Notion 工作区。</p><Refresh retry /></>}
          <ol><li>打开任务所在的 Notion 工作区。</li><li>在 Notion 侧栏进入“回收站”。</li><li>找到任务并选择“恢复”。返回此页后重新加载页面。</li></ol>
          <p className="muted">数据库入口不会直接打开回收站。网页暂不提供删除、回收站恢复或永久删除。</p>
        </section>}
      </div>
    </main>
  </div>;
}
