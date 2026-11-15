export function taskView(value) {
  return ['open', 'completed', 'trash'].includes(value) ? value : 'open';
}

export function tasksInView(tasks, view) {
  return view === 'trash' ? [] : tasks.filter(task => task.completed === (view === 'completed'));
}
