import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
    const { email, code } = await req.json();

    if (!email || !code) {
        return NextResponse.json({ error: 'Email and code required' }, { status: 400 });
    }

    console.log(`🔐 Verifying MFA for ${email} with code ${code}`);

    const { data: mfaRecord, error: dbError } = await supabase
        .from('mfa_codes')
        .select()
        .eq('email', email)
        .eq('code', code)
        .gt('expires_at', new Date().toISOString())
        .eq('used', false)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

    if (dbError || !mfaRecord) {
        console.error('❌ No valid MFA record found');
        return NextResponse.json({ error: 'Invalid or expired code' }, { status: 401 });
    }

    console.log(`✅ Code found, marking as used`);

    await supabase
        .from('mfa_codes')
        .update({ used: true })
        .eq('id', mfaRecord.id);

    const { data: { users }, error: userError } = await supabase.auth.admin.listUsers();

    if (userError || !users) {
        console.error('❌ Failed to list users:', userError);
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const user = users.find(u => u.email === email);

    if (!user) {
        console.error('❌ User not found in auth');
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const { data: linkData, error: linkError } = await supabase.auth.admin.generateLink({
        type: 'magiclink',
        email,
    });

    if (linkError || !linkData?.properties?.hashed_token) {
        console.error('❌ Generate link error:', linkError);
        return NextResponse.json({ error: 'Failed to create session' }, { status: 500 });
    }

    console.log(`✅ Generated link with token hash`);

    try {
        const verifyResponse = await fetch(
            `${process.env.NEXT_PUBLIC_SUPABASE_URL}/auth/v1/verify`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
                },
                body: JSON.stringify({
                    token_hash: linkData.properties.hashed_token,
                    type: 'magiclink',
                }),
            }
        );

        const responseText = await verifyResponse.text();

        if (!verifyResponse.ok) {
            console.error('❌ Verify error:', responseText);
            return NextResponse.json({ error: 'Failed to verify token' }, { status: 500 });
        }

        const sessionData = JSON.parse(responseText);

        if (!sessionData.access_token || !sessionData.refresh_token) {
            console.error('❌ No tokens in response');
            return NextResponse.json({ error: 'No session created' }, { status: 500 });
        }

        console.log(`✅ MFA verified and session created for ${email}`);

        // 🆕 Возвращаем токены КЛИЕНТУ (не только в cookies)
        const response = NextResponse.json({
            success: true,
            message: 'MFA verified',
            access_token: sessionData.access_token,
            refresh_token: sessionData.refresh_token,
            user: {
                id: sessionData.user.id,
                email: sessionData.user.email,
            },
        });

        // Также устанавливаем cookies для безопасности
        response.cookies.set({
            name: 'sb-access-token',
            value: sessionData.access_token,
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 60 * 60 * 24 * 7,
        });

        response.cookies.set({
            name: 'sb-refresh-token',
            value: sessionData.refresh_token,
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 60 * 60 * 24 * 7,
        });

        return response;
    } catch (error) {
        console.error('❌ Verify error:', error);
        return NextResponse.json({ error: 'Failed to create session' }, { status: 500 });
    }
}