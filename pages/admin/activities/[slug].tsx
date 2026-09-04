import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Layout from '../../../components/Layout';
import ActivityForm from '../../../components/admin/ActivityForm';
import { Activity } from '../../../lib/dataService';
import { getLoggedInUser } from '../../../lib/clientAuth';

export default function EditActivityPage() {
  const router = useRouter();
  const { slug } = router.query;
  const [activity, setActivity] = useState<Activity | null>(null);
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    const user = getLoggedInUser();
    if (!user || user.role !== 'admin') {
      const slugStr = Array.isArray(slug) ? slug[0] : slug || '';
      router.push(`/login?callbackUrl=/admin/activities/${slugStr}`);
    } else {
      setAuthorized(true);
    }
  }, [router, slug]);

  useEffect(() => {
    if (!slug || !authorized) return;
    const slugStr = Array.isArray(slug) ? slug[0] : slug;
    fetch(`/api/activities/${slugStr}`)
      .then((r) => r.json())
      .then((d) => {
        setActivity(d);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [slug, authorized]);

  if (!authorized) {
    return (
      <Layout title="Edit Activity - Admin">
        <div className="pt-28 pb-20 px-6 max-w-4xl mx-auto text-center text-xs text-gray-400">
          Checking permissions...
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Edit Activity - Admin">
      <div className="pt-28 pb-20 px-6 max-w-4xl mx-auto">
        {loading ? (
          <p className="text-xs text-gray-400">Loading activity...</p>
        ) : activity ? (
          <ActivityForm initialData={activity} isNew={false} />
        ) : (
          <p className="text-xs text-red-500">Activity not found.</p>
        )}
      </div>
    </Layout>
  );
}
