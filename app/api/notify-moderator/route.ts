import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import nodemailer from 'nodemailer';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASSWORD,
    },
});

export async function POST(req: NextRequest) {
    try {
        const { bookId, text, aiScore } = await req.json();

        // Получаем название книги
        const { data: book } = await supabase
            .from('books')
            .select('title')
            .eq('id', bookId)
            .single();

        // Отправляем письмо админу
        await transporter.sendMail({
            from: process.env.GMAIL_USER,to: process.env.MODERATOR_EMAIL || 'mariam.orazbaeva@icloud.com',
            subject: `🚨 Новый комментарий на модерации — ${book?.title || 'Неизвестная книга'}`,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #f9f9f9;">
                    <h2 style="color: #333;">Комментарий требует модерации</h2>
                    <p style="font-size: 14px; color: #666;">
                        <strong>Риск:</strong> 
                        <span style="background: ${aiScore > 0.7 ? '#ff6b6b' : '#51cf66'}; color: white; padding: 5px 10px; border-radius: 4px;">
                            ${(aiScore * 100).toFixed(0)}%
                        </span>
                    </p>
                    <div style="background: white; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #3498db;">
                        <p style="color: #999; font-size: 12px; margin: 0 0 10px 0;">Текст комментария:</p>
                        <p style="color: #333; margin: 0; word-break: break-word;">${text}</p>
                    </div>
                    <p>
                        <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/admin/moderation" style="background: #3498db; color: white; padding: 12px 24px; border-radius: 5px; text-decoration: none; display: inline-block; font-weight: bold;">
    ➡️ Перейти к модерации
</a>
                    </p>
                    <p style="font-size: 12px; color: #999; margin-top: 20px;">
                        Это письмо отправлено автоматически. Пожалуйста, не отвечайте на него.
                    </p>
                </div>
            `,
        });

        return NextResponse.json({ success: true });
    } catch (err) {
        console.error('Notification error:', err);
        return NextResponse.json({ success: false, error: String(err) }, { status: 500 });
    }
}