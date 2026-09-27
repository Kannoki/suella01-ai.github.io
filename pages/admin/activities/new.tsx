import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Layout from '../../../components/Layout';
import ActivityForm from '../../../components/admin/ActivityForm';
import { getLoggedInUser } from '../../../lib/clientAuth';
import { Role } from '../../../prisma/generated/enums';

export default function NewActivityPage() {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    const user = getLoggedInUser();
    if (!user || user.role !== Role.ADMIN) {
      router.push('/login?callbackUrl=/admin/activities/new');
    } else {
      setAuthorized(true);
    }
  }, [router]);

  if (!authorized) {
    return (
      <Layout title="New Activity - Admin">
        <div className="pt-28 pb-20 px-6 max-w-4xl mx-auto text-center text-xs text-gray-400">
          Checking permissions...
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="New Activity - Admin">
      <div className="pt-28 pb-20 px-6 max-w-4xl mx-auto">
        <ActivityForm isNew />
      </div>
    </Layout>
  );
}
