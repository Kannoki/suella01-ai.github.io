import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Layout from '../../../components/Layout';
import ActivityForm from '../../../components/admin/ActivityForm';
import { Activity } from '../../../lib/dataService';

export default function EditActivityPage() {
  const router = useRouter();
  const { slug } = router.query;
  const [activity, setActivity] = useState<Activity | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;
    const slugStr = Array.isArray(slug) ? slug[0] : slug;
    fetch(`/api/activities/${slugStr}`)
      .then((r) => r.json())
      .then((d) => {
        setActivity(d);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [slug]);

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
