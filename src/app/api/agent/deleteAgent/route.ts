import { db } from "@/lib/db"
import { $agents } from "@/lib/db/schema"
import { eq } from "drizzle-orm"
import { NextResponse } from "next/server"
import { deleteRetellAgent, deleteRetellPhoneNumber } from "@/services/retellAI"

export async function POST(req: Request) {
    const { agentId, deletePhoneNumber } = await req.json()

    // Fetch the agent from the database
    const agents = await db.select().from($agents).where(eq($agents.id, agentId))
    const agent = agents[0]

    if (!agent) {
        return new NextResponse('Agent not found', { status: 404 })
    }

    // If the agent has a retellAgentId, delete it from Retell
    if (agent.retellAgentId) {
        try {
            await deleteRetellAgent(agent.retellAgentId)
        } catch (error) {
            console.error('Error deleting Retell agent:', error)
            // Continue with deletion even if Retell deletion fails
        }
    }

    // If deletePhoneNumber is true and the agent has a phoneNumber, delete it from Retell
    if (deletePhoneNumber && agent.phoneNumber) {
        try {
            await deleteRetellPhoneNumber(agent.phoneNumber)
        } catch (error) {
            console.error('Error deleting Retell phone number:', error)
            // Continue with deletion even if phone number deletion fails
        }
    }

    // Delete the agent from the database
    await db.delete($agents).where(eq($agents.id, agentId))

    return new NextResponse('ok', { status: 200 })
}