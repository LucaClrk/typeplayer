import { neon } from '@neondatabase/serverless';

export async function handler(event) {
    const sql = neon(process.env);

    try {
        const result = await sql`SELECT NOW()`;

        return {
            statusCode: 200,
            body: JSON.stringify(result)
        };
    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: error.message })
        };
    }
}
