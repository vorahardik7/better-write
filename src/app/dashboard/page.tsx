import { auth } from '../../../auth';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import DashboardClient from './dashboard-client';

export default async function Dashboard() {
  const session = await auth.api.getSession({
    headers: await headers()
  });

  if (!session) {
    redirect('/');
  }

  return <DashboardClient session={session} />;
}
