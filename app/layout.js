import 'react-datepicker/dist/react-datepicker.css';
import './globals.css';

export const metadata = {
  title: 'todo · Notion 任务',
  description: '快速查看、新增和完成 Notion 任务。',
};

export default function RootLayout({ children }) {
  return <html lang="zh-CN"><body>{children}</body></html>;
}
