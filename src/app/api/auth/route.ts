import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { action } = body;

    if (action === 'register') {
      const { username, password, name, storeName, businessType, phone } = body;
      if (!username || !password || !storeName) {
        return NextResponse.json(
          { success: false, error: 'Username, password, dan nama toko wajib diisi' },
          { status: 400 }
        );
      }

      // Cek apakah username sudah dipakai di database
      try {
        const existing = await prisma.user.findFirst({
          where: {
            OR: [
              { username: username.toLowerCase().trim() },
              ...(phone ? [{ phone: phone.trim() }] : []),
            ],
          },
        });

        if (existing) {
          return NextResponse.json(
            { success: false, error: 'Username atau No HP sudah terdaftar. Silakan login atau gunakan username lain.' },
            { status: 400 }
          );
        }

        const newUser = await prisma.user.create({
          data: {
            username: username.toLowerCase().trim(),
            password: password,
            storeName: storeName.trim(),
            ownerName: name?.trim() || null,
            phone: phone?.trim() || null,
            businessType: businessType || 'WARUNG',
            role: 'USER',
          },
        });

        return NextResponse.json({
          success: true,
          user: {
            id: newUser.id,
            username: newUser.username,
            name: newUser.ownerName || newUser.username,
            storeName: newUser.storeName,
            businessType: newUser.businessType,
            role: newUser.role,
            createdAt: newUser.createdAt.toISOString(),
          },
        });
      } catch (dbErr: any) {
        console.warn('DB register fallback to client:', dbErr.message);
        // Tetap sukseskan agar offline/local-first berjalan
        return NextResponse.json({
          success: true,
          offlineMode: true,
          user: {
            id: 'user-' + Date.now(),
            username: username.toLowerCase().trim(),
            name: name?.trim() || username,
            storeName: storeName.trim(),
            businessType: businessType || 'WARUNG',
            role: 'USER',
            createdAt: new Date().toISOString(),
          },
        });
      }
    }

    if (action === 'login') {
      const { username, password } = body;
      const cleanUsername = username?.toLowerCase().trim();

      // Cek akun default admin
      if (cleanUsername === 'admin' && password === 'admin1234') {
        return NextResponse.json({
          success: true,
          user: {
            id: 'tenant-admin',
            username: 'admin',
            name: 'Admin / Pemilik',
            storeName: 'Toko Berkah Saya',
            businessType: 'WARUNG',
            role: 'ADMIN',
            createdAt: '2026-01-01',
          },
        });
      }

      try {
        const found = await prisma.user.findFirst({
          where: {
            OR: [
              { username: cleanUsername },
              { phone: cleanUsername },
            ],
          },
        });

        if (found && found.password === password) {
          return NextResponse.json({
            success: true,
            user: {
              id: found.id,
              username: found.username || cleanUsername,
              name: found.ownerName || found.username || 'Pengguna',
              storeName: found.storeName,
              businessType: found.businessType,
              role: found.role,
              createdAt: found.createdAt.toISOString(),
            },
          });
        }

        return NextResponse.json(
          { success: false, error: 'Username atau password salah' },
          { status: 401 }
        );
      } catch (dbErr: any) {
        console.warn('DB login fallback:', dbErr.message);
        return NextResponse.json(
          { success: false, error: 'Gagal menghubungi database, cek login lokal' },
          { status: 401 }
        );
      }
    }

    if (action === 'update_store') {
      const { userId, storeName, ownerName, businessType } = body;
      try {
        if (userId && !userId.startsWith('tenant-')) {
          await prisma.user.update({
            where: { id: userId },
            data: {
              storeName: storeName.trim(),
              ownerName: ownerName?.trim() || null,
              businessType: businessType || 'WARUNG',
            },
          });
        }
        return NextResponse.json({ success: true });
      } catch (e: any) {
        return NextResponse.json({ success: false, error: e.message }, { status: 500 });
      }
    }

    return NextResponse.json({ success: false, error: 'Aksi tidak dikenali' }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
