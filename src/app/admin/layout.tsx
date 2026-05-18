import { createClient } from '@/lib/supabase/server';
import { getLoginRedirect } from '@/lib/admin-data';
import { redirect } from 'next/navigation';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect(getLoginRedirect('/admin'));
  }

  // Check if user is admin in profiles table
  const { data: profile } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('id', user.id)
    .single();

  if (!profile?.is_admin) {
    redirect('/');
  }

  return (
    <>
      {children}
    </>
  );
}
