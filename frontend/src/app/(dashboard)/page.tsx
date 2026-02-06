import { redirect } from 'next/navigation';

export default function DashboardPage() {
  // Redirect to search as the main landing page
  redirect('/search');
}
