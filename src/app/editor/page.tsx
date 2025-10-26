import { auth } from '../../../auth';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import EditorPageClient from './editor-client';

export default async function EditorPage() {
  const session = await auth.api.getSession({
    headers: await headers()
  });

  if (!session) {
    redirect('/');
  }

  return <EditorPageClient session={session} />;
}