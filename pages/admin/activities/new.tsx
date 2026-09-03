import React from 'react';
import Layout from '../../../components/Layout';
import ActivityForm from '../../../components/admin/ActivityForm';

export default function NewActivityPage() {
  return (
    <Layout title="New Activity - Admin">
      <div className="pt-28 pb-20 px-6 max-w-4xl mx-auto">
        <ActivityForm isNew />
      </div>
    </Layout>
  );
}
