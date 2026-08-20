// import { NextRequest, NextResponse } from 'next/server';
// import { createClient } from '@supabase/supabase-js';
// import nodemailer from 'nodemailer';
//
// const supabase = createClient(
//     process.env.NEXT_PUBLIC_SUPABASE_URL!,
//     process.env.SUPABASE_SERVICE_ROLE_KEY!
// );
//
// const transporter = nodemailer.createTransport({
//     host: 'smtp.gmail.com',
//     port: 587,
//     secure: false, // STARTTLS, не SSL
//     auth: {
//         user: process.env.GMAIL_USER,
//         pass: process.env.GMAIL_PASSWORD,
//     },
//     connectionTimeout: 8000, // 8 секунд максимум
// });
//
// export async function POST(req: NextRequest) {
//     const { email } = await req.json();
//
//     if (!email) {
//         return NextResponse.json({ error: 'Email required' }, { status: 400 });
//     }
//
//     const code = Math.random().toString(36).substring(2, 8).toUpperCase();
//     const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
//
//     // Сохраняем код в БД
//     const { error: dbError } = await supabase.from('mfa_codes').insert({
//         email,
//         code,
//         expires_at: expiresAt.toISOString(),
//     });
//
//     if (dbError) {
//         console.error('DB error:', dbError);
//         return NextResponse.json({ error: 'Failed to generate code' }, { status: 500 });
//     }
//
//     // Отправляем письмо
//     try {
//         await transporter.sendMail({
//             from: process.env.GMAIL_USER,
//             to: email,
//             subject: '🔐 Код подтверждения MIA Law',
//             html: `
//                 <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto;">
//                     <h2>Код подтверждения</h2>
//                     <p>Используйте этот код для входа в админку:</p>
//                     <div style="background: #f0f0f0; padding: 20px; text-align: center; border-radius: 8px; margin: 20px 0;">
//                         <h1 style="margin: 0; letter-spacing: 5px; color: #333;">${code}</h1>
//                     </div>
//                     <p style="color: #666; font-size: 12px;">Код действует 10 минут</p>
//                     <p style="color: #999; font-size: 11px;">Если это не вы — просто проигнорируйте это письмо</p>
//                 </div>
//             `,
//         });
//     } catch (err) {
//         console.error('Email error:', err);
//         return NextResponse.json({ error: 'Failed to send email' }, { status: 500 });
//     }
//
//     return NextResponse.json({ success: true, message: 'Code sent' });
// }

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: NextRequest) {
    const { email } = await req.json();

    if (!email) {
        return NextResponse.json({ error: 'Email required' }, { status: 400 });
    }

    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    console.log(`🔑🔑🔑 MFA КОД для ${email}: ${code} 🔑🔑🔑`);

    const { error: dbError } = await supabase.from('mfa_codes').insert({
        email,
        code,
        expires_at: expiresAt.toISOString(),
    });

    if (dbError) {
        console.error('DB error:', dbError);
        return NextResponse.json({ error: 'Failed to generate code' }, { status: 500 });
    }

    try {
        await resend.emails.send({
            from: 'MIA Law <onboarding@resend.dev>', // временно, пока нет своего домена
            to: email,
            subject: '🔐 Код подтверждения MIA Law',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto;">
                    <h2>Код подтверждения</h2>
                    <p>Используйте этот код для входа в админку:</p>
                    <div style="background: #f0f0f0; padding: 20px; text-align: center; border-radius: 8px; margin: 20px 0;">
                        <h1 style="margin: 0; letter-spacing: 5px; color: #333;">${code}</h1>
                    </div>
                    <p style="color: #666; font-size: 12px;">Код действует 10 минут</p>
                    <p style="color: #999; font-size: 11px;">Если это не вы — просто проигнорируйте это письмо</p>
                </div>
            `,
        });
    } catch (err) {
        console.error('Email error:', err);
        return NextResponse.json({ error: 'Failed to send email' }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: 'Code sent' });
}

