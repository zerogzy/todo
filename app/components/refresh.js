'use client';

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';

export default function Refresh({ retry = false }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  return <button type="button" disabled={pending} onClick={() => startTransition(() => router.refresh())}>{pending ? '刷新中…' : retry ? '重试' : '刷新'}</button>;
}
