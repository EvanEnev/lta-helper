import conn from "@/lib/database"
import { Comment } from "./types"

export default async function getComments(name: string): Promise<Comment[]> {
    const query = 'SELECT date, value FROM lt_arena.comments WHERE worker = $1'

    const commentsData = await conn.query(query, [name])
    const comments = commentsData.rows as Comment[]

    return comments
}