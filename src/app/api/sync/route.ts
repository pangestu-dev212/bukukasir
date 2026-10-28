import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { profile, transactions, debts } = body;

    if (!profile?.storeName) {
      return NextResponse.json({ success: false, error: 'Profil toko tidak valid' }, { status: 400 });
    }

    // Cari atau buat user berdasarkan nama toko & phone
    let user = null;
    if (profile.phone) {
      user = await prisma.user.findUnique({
        where: { phone: profile.phone },
      });
    }

    if (!user) {
      user = await prisma.user.create({
        data: {
          storeName: profile.storeName,
          ownerName: profile.ownerName || null,
          phone: profile.phone || null,
          businessType: profile.businessType || 'WARUNG',
        },
      });
    } else {
      user = await prisma.user.update({
        where: { id: user.id },
        data: {
          storeName: profile.storeName,
          ownerName: profile.ownerName || null,
          businessType: profile.businessType || 'WARUNG',
        },
      });
    }

    // Simpan transaksi
    if (Array.isArray(transactions) && transactions.length > 0) {
      for (const t of transactions) {
        await prisma.transaction.upsert({
          where: { id: t.id },
          create: {
            id: t.id,
            userId: user.id,
            type: t.type,
            scope: t.scope || 'BUSINESS',
            amount: t.amount,
            categoryName: t.categoryName,
            note: t.note || null,
            date: new Date(t.date),
            paymentMethod: t.paymentMethod || 'TUNAI',
          },
          update: {
            type: t.type,
            scope: t.scope || 'BUSINESS',
            amount: t.amount,
            categoryName: t.categoryName,
            note: t.note || null,
            date: new Date(t.date),
            paymentMethod: t.paymentMethod || 'TUNAI',
          },
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Data berhasil disinkronkan ke Cloud PostgreSQL!',
      userId: user.id,
    });
  } catch (error: any) {
    console.error('Sync Error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Gagal sinkronisasi data' },
      { status: 500 }
    );
  }
}
