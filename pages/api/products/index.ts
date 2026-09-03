import type { NextApiRequest, NextApiResponse } from 'next';
import { getProducts, createProduct } from '../../../lib/dataService';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const products = await getProducts();
      return res.status(200).json(products);
    } catch (err: any) {
      return res.status(500).json({ error: err.message || 'Failed to fetch products' });
    }
  }

  if (req.method === 'POST') {
    try {
      const newProduct = await createProduct(req.body);
      return res.status(201).json(newProduct);
    } catch (err: any) {
      return res.status(500).json({ error: err.message || 'Failed to create product' });
    }
  }

  res.setHeader('Allow', ['GET', 'POST']);
  return res.status(405).end(`Method ${req.method} Not Allowed`);
}
