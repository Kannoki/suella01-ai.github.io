import React from 'react';
import Layout from '../../../components/Layout';
import ProductForm from '../../../components/admin/ProductForm';

export default function NewProductPage() {
  return (
    <Layout title="New Project - Admin">
      <div className="pt-28 pb-20 px-6 max-w-4xl mx-auto">
        <ProductForm isNew />
      </div>
    </Layout>
  );
}
