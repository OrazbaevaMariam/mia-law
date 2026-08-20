import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASSWORD,
    },
});

export async function GET(req: NextRequest) {
    try {
        await transporter.sendMail({
            from: process.env.GMAIL_USER,
            to: 'mariam.orazbaeva@icloud.com',
            subject: '🧪 Тестовое письмо из Mia Law',
            html: `<h2>Привет!</h2><p>Если ты видишь это письмо, значит почта работает! ✅</p>`,
        });

        return NextResponse.json({ success: true, message: 'Email sent!' });
    } catch (err) {
        console.error('Error:', err);
        return NextResponse.json({ error: String(err) }, { status: 500 });
    }
}