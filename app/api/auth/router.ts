// app/api/auth/route.js
import { NextResponse } from 'next/server';
import { decryptTPAuth } from './crypto';
import { cookies } from 'next/headers';

const API_KEY = process.env.TP_API_KEY; // .env.local’a TP_API_KEY olarak ekle

export async function GET(request: Request) {
  const url = new URL(request.url);
  // Eğer zaten cookie varsa direkt geri dönülebilir:
  const existing = (await cookies()).get('tp_auth')?.value;
  if (typeof existing === 'string') {
    if (!API_KEY) {
      return NextResponse.json({ error: 'API_KEY is not set' }, { status: 500 });
    }
    const user = decryptTPAuth(existing as string, API_KEY as string);
    if (user) {
      return NextResponse.json({ user });
    }
  }

  // Eğer ?">start" parametresi yoksa, auth endpoint’ine yönlendir:
  if (!url.searchParams.has('>start')) {
    return NextResponse.redirect('https://topluyo.com/!auth/' + process.env.APP_ID);
  }

  // Yükleme animasyonu vs. sayfa için burada bir HTML dönebilirsin:
  return NextResponse.json({ loading: true });
}

export async function POST(request: Request) {
  const body = await request.formData();
  const authCode = body.get('>auth');
  if (!authCode) {
    return NextResponse.json({ error: 'No auth code' }, { status: 400 });
  }

  const payload = decryptTPAuth(
    typeof authCode === 'string' ? authCode : '',
    API_KEY as string
  );
  if (!payload) {
    return NextResponse.json({ error: 'Auth problem' }, { status: 401 });
  }

  // Cookie ayarla (7 gün)
  const res = NextResponse.json({ redirect: payload.redirectUrl || '/' });
  const expires = new Date(Date.now() + 1000 * 60 * 60 * 24 * 7);
  res.cookies.set(
    'tp_auth',
    typeof authCode === 'string' ? authCode : String(authCode),
    {
      path: '/',
      secure: true,
      sameSite: 'none',
      expires
    }
  );

  // Eğer redirect parametre ile yeni pencereye gönderilecekse:
  if (body.get('redirect') === '1') {
    return res;
  } else {
    return NextResponse.redirect(payload.redirectUrl || '/');
  }
}
