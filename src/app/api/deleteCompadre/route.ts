import { db } from "@/lib/db"
import { $compadres } from "@/lib/db/schema"
import { eq } from "drizzle-orm"
import { NextResponse } from "next/server"
import axios from "axios"

export async function POST(req: Request) {
    const { compadreId } = await req.json()

    // Clear memories from mem0 using REST API
    try {
        const response = await fetch(`https://api.mem0.ai/v1/memories/?user_id=${compadreId}`, {
            headers: {
                Authorization: `Token ${process.env.MEM0_API_KEY}`
            },
            method: 'DELETE'
        })

        if (!response.ok) {
            throw new Error("Failed to clear memories from mem0")
        }
    } catch (error) {
        console.error("Error clearing memories from mem0:", error)
        return new NextResponse('Error clearing memories', { status: 500 })
    }

    // Delete the compadre from the database
    await db.delete($compadres).where(
        eq($compadres.id, compadreId)
    )

    return new NextResponse('ok', { status: 200 })
}