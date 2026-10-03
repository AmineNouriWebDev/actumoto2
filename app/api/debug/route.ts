import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  const models = await prisma.model.findMany({
    select: { name: true, price: true, promoPrice: true }
  });
  return NextResponse.json(models);
}
