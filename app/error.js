'use client';

export default function ErrorPage({ reset }) {
  return <main className="route-state"><h1>todo</h1><p role="alert">任务暂时无法显示，请重试。</p><button onClick={reset}>重试</button></main>;
}
