import { NextResponse } from "next/server"

function verifyYooKassaSignature(body: string, signature: string): boolean {
    const secretKey = process.env.YOOKASSA_SECRET_KEY!
    const data = `${body}${secretKey}`
    
    const hash = crypto
        .createHash("sha256")
        .update(data)
        .digest("hex")

    return hash === signature
}

export async function POST(request: Request) {
    try {
        const body = await request.text()
        const signature = request.headers.get("x-yookassa-signature") || ""

        if (!verifyYooKassaSignature(body, signature)) {
            return NextResponse.json({ error: "Invalid signature" }, { status: 401 })
        }

        return NextResponse.json({ success: true })
    } catch {
        return NextResponse.json({ error: "Webhook failed" }, { status: 500 })
    }
}
