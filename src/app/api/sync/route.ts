import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET: Tarik data transaksi & kasbon dari cloud Supabase
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');
    const username = searchParams.get('username');

    if (!userId && !username) {
      return NextResponse.json({ success: false, error: 'User ID atau username diperlukan' }, { status: 400 });
    }

    let user = null;
    if (userId && !userId.startsWith('tenant-admin')) {
      user = await prisma.user.findUnique({ where: { id: userId } });
    }
    if (!user && username) {
      user = await prisma.user.findFirst({ where: { username: username.toLowerCase().trim() } });
    }

    if (!user) {
      return NextResponse.json({ success: true, transactions: [], debts: [] });
    }

    const [dbTransactions, dbDebts] = await Promise.all([
      prisma.transaction.findMany({
        where: { userId: user.id },
        orderBy: { date: 'desc' },
        take: 500,
      }),
      prisma.debtBook.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: 'desc' },
        take: 200,
      }),
    ]);

    const transactions = dbTransactions.map((t) => ({
      id: t.id,
      storeId: 'store-utama',
      type: t.type,
      scope: t.scope,
      amount: t.amount,
      categoryName: t.categoryName || 'Lainnya',
      note: t.note || '',
      date: t.date.toISOString().split('T')[0],
      paymentMethod: t.paymentMethod,
      createdAt: t.createdAt.toISOString(),
    }));

    const debts = dbDebts.map((d) => ({
      id: d.id,
      storeId: 'store-utama',
      personName: d.personName,
      personPhone: d.personPhone || '',
      type: d.type,
      amount: d.amount,
      paidAmount: d.paidAmount,
      note: d.note || '',
      dueDate: d.dueDate ? d.dueDate.toISOString().split('T')[0] : undefined,
      status: d.status,
      createdAt: d.createdAt.toISOString(),
    }));

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        storeName: user.storeName,
        ownerName: user.ownerName,
        businessType: user.businessType,
      },
      transactions,
      debts,
    });
  } catch (error: any) {
    console.error('Sync GET error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// POST: Simpan / Sinkronkan data transaksi & kasbon ke cloud Supabase
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { userId, username, profile, transactions, debts } = body;

    // 1. Temukan user di cloud
    let user = null;
    if (userId && !userId.startsWith('tenant-admin')) {
      user = await prisma.user.findUnique({ where: { id: userId } });
    }
    if (!user && username) {
      user = await prisma.user.findFirst({ where: { username: username.toLowerCase().trim() } });
    }
    if (!user && profile?.phone) {
      user = await prisma.user.findUnique({ where: { phone: profile.phone.trim() } });
    }

    // Jika user belum ada di DB (misal pengguna lama yang baru sinkron), buatkan user
    if (!user) {
      if (!profile?.storeName) {
        return NextResponse.json({ success: false, error: 'Profil toko tidak valid' }, { status: 400 });
      }
      user = await prisma.user.create({
        data: {
          username: username ? username.toLowerCase().trim() : 'user_' + Date.now(),
          storeName: profile.storeName.trim(),
          ownerName: profile.ownerName?.trim() || null,
          phone: profile.phone?.trim() || null,
          businessType: profile.businessType || 'WARUNG',
        },
      });
    }

    // 2. Simpan / Upsert Transaksi
    if (Array.isArray(transactions) && transactions.length > 0) {
      for (const t of transactions) {
        if (!t.id || !t.amount) continue;
        await prisma.transaction.upsert({
          where: { id: t.id },
          create: {
            id: t.id,
            userId: user.id,
            type: t.type,
            scope: t.scope || 'BUSINESS',
            amount: Number(t.amount) || 0,
            categoryName: t.categoryName || 'Lainnya',
            note: t.note || null,
            date: new Date(t.date || Date.now()),
            paymentMethod: t.paymentMethod || 'TUNAI',
          },
          update: {
            type: t.type,
            scope: t.scope || 'BUSINESS',
            amount: Number(t.amount) || 0,
            categoryName: t.categoryName || 'Lainnya',
            note: t.note || null,
            date: new Date(t.date || Date.now()),
            paymentMethod: t.paymentMethod || 'TUNAI',
          },
        });
      }
    }

    // 3. Simpan / Upsert Kasbon & Utang
    if (Array.isArray(debts) && debts.length > 0) {
      for (const d of debts) {
        if (!d.id || !d.personName) continue;
        await prisma.debtBook.upsert({
          where: { id: d.id },
          create: {
            id: d.id,
            userId: user.id,
            personName: d.personName.trim(),
            personPhone: d.personPhone?.trim() || null,
            type: d.type || 'RECEIVABLE',
            amount: Number(d.amount) || 0,
            paidAmount: Number(d.paidAmount) || 0,
            note: d.note || null,
            dueDate: d.dueDate ? new Date(d.dueDate) : null,
            status: d.status || 'BELUM_LUNAS',
          },
          update: {
            personName: d.personName.trim(),
            personPhone: d.personPhone?.trim() || null,
            type: d.type || 'RECEIVABLE',
            amount: Number(d.amount) || 0,
            paidAmount: Number(d.paidAmount) || 0,
            note: d.note || null,
            dueDate: d.dueDate ? new Date(d.dueDate) : null,
            status: d.status || 'BELUM_LUNAS',
          },
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Semua transaksi & kasbon berhasil disinkronkan ke Cloud Supabase!',
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
