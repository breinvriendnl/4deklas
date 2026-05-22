const { neon } = require('@neondatabase/serverless')

async function parseBody(req) {
  return new Promise((resolve) => {
    let data = ''
    req.on('data', chunk => { data += chunk })
    req.on('end', () => {
      try { resolve(JSON.parse(data)) } catch { resolve({}) }
    })
  })
}

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')

  const sql = neon(process.env.POSTGRES_URL)
  const body = ['POST','PATCH','DELETE'].includes(req.method) ? await parseBody(req) : {}

  if (req.method === 'GET') {
    const items = await sql`SELECT * FROM feedback_items ORDER BY created_at DESC`
    return res.json(items)
  }

  if (req.method === 'POST') {
    const { title, description, pagina, created_by } = body
    if (!title) return res.status(400).json({ error: 'Titel verplicht' })
    const rows = await sql`
      INSERT INTO feedback_items (title, description, pagina, created_by)
      VALUES (${title}, ${description || ''}, ${pagina || 'algemeen'}, ${created_by || 'Guido'})
      RETURNING *
    `
    return res.json(rows[0])
  }

  if (req.method === 'PATCH') {
    const { id, status } = body
    await sql`UPDATE feedback_items SET status = ${status}, updated_at = NOW() WHERE id = ${id}`
    return res.json({ ok: true })
  }

  if (req.method === 'DELETE') {
    const { id } = body
    await sql`DELETE FROM feedback_items WHERE id = ${id}`
    return res.json({ ok: true })
  }

  res.status(405).json({ error: 'Method not allowed' })
}
