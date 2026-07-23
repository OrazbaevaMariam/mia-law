import { NextRequest, NextResponse } from "next/server"

interface PaymentRequest {
    userId: string
    amount: number
    bookId: string
}

export async function POST(request: NextRequest) {
    try {
        await request.json() as PaymentRequest

        return NextResponse.json({ success: true })
    } catch {
        return NextResponse.json({ error: "Failed to create payment" }, { status: 500 })
    }
}
