import type { NextApiRequest, NextApiResponse } from 'next';
import { getProductBySlug, updateProduct, deleteProduct } from '../../../lib/dataService';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;
  const idStr = Array.isArray(id) ? id[0] : id;

  if (!idStr) {
    return res.status(400).json({ error: 'Missing product ID or slug' });
  }

  if (req.method === 'GET') {
    try {
      const product = await getProductBySlug(idStr);
      if (!product) {
        return res.status(404).json({ error: 'Product not found' });
      }
      return res.status(200).json(product);
    } catch (err: any) {
      return res.status(500).json({ error: err.message || 'Failed to fetch product' });
    }
  }

  if (req.method === 'PUT') {
    try {
      const updated = await updateProduct(idStr, req.body);
      if (!updated) {
        return res.status(404).json({ error: 'Product not found' });
      }
      return res.status(200).json(updated);
    } catch (err: any) {
      return res.status(500).json({ error: err.message || 'Failed to update product' });
    }
  }

  if (req.method === 'DELETE') {
    try {
      const deleted = await deleteProduct(idStr);
      return res.status(200).json({ success: deleted });
    } catch (err: any) {
      return res.status(500).json({ error: err.message || 'Failed to delete product' });
    }
  }

  res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
  return res.status(405).end(`Method ${req.method} Not Allowed`);
}
