import type { NextApiRequest, NextApiResponse } from 'next';
import { swaggerSpec } from '../../lib/swaggerSpec';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  res.setHeader('Content-Type', 'application/json');
  return res.status(200).json(swaggerSpec);
}
