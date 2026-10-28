import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const dbUrl = process.env.DATABASE_URL ? process.env.DATABASE_URL.replace(/:[^:@]+@/, ':***@') : 'TIDAK_ADA';
    const userCount = await prisma.user.count();
    return NextResponse.json({
      status: 'TERHUBUNG',
      databaseUrlMasked: dbUrl,
      userCount,
    });
  } catch (error: any) {
    const dbUrl = process.env.DATABASE_URL ? process.env.DATABASE_URL.replace(/:[^:@]+@/, ':***@') : 'TIDAK_ADA';
    return NextResponse.json({
      status: 'GAGAL',
      databaseUrlMasked: dbUrl,
      errorName: error.name,
      errorMessage: error.message,
    }, { status: 500 });
  }
}
