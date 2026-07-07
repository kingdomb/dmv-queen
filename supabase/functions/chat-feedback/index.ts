import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// --- Abuse controls (light — feedback is low-value to spam) -----------------
const MAX_COMMENT_LEN = 2000
const MAX_TRANSCRIPT_TURNS = 20     // only keep the last N turns for context
const MAX_TRANSCRIPT_CONTENT = 2000 // cap each stored message
const PER_IP_PER_MIN = 10
const PER_IP_PER_DAY = 40

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const body = await req.json().catch(() => ({}))

    const rating = body?.rating === 'up' || body?.rating === 'down' ? body.rating : null
    const comment = typeof body?.comment === 'string'
      ? body.comment.trim().slice(0, MAX_COMMENT_LEN)
      : ''
    const sessionId = typeof body?.sessionId === 'string' ? body.sessionId.slice(0, 64) : null
    const messageCount = Number.isFinite(body?.messageCount) ? Math.trunc(body.messageCount) : null

    // Nothing meaningful to record — succeed quietly so the client can still close.
    if (!rating && !comment) return json({ ok: true, stored: false })

    // Sanitize + cap the transcript so a client can't bloat the row.
    const rawTranscript = Array.isArray(body?.transcript) ? body.transcript : []
    const transcript = rawTranscript
      .filter((m: any) => m && (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string')
      .slice(-MAX_TRANSCRIPT_TURNS)
      .map((m: any) => ({ role: m.role, content: String(m.content).slice(0, MAX_TRANSCRIPT_CONTENT) }))

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // ---- Light rate limiting (reuses request_logs, like the chat function) ----
    const xff = req.headers.get('x-forwarded-for') || ''
    const hops = xff.split(',').map((s) => s.trim()).filter(Boolean)
    const clientIP = hops.length ? hops[hops.length - 1] : 'unknown'

    const now = Date.now()
    const dayAgo = new Date(now - 24 * 60 * 60 * 1000).toISOString()
    const minAgo = new Date(now - 60 * 1000).toISOString()

    const countLogs = async (filters: (q: any) => any) => {
      let q = supabase.from('request_logs').select('*', { count: 'exact', head: true }).eq('function_name', 'chat_feedback')
      q = filters(q)
      const { count } = await q
      return count ?? 0
    }

    const [ipToday, ipLastMin] = await Promise.all([
      countLogs((q) => q.eq('ip_address', clientIP).gt('created_at', dayAgo)),
      countLogs((q) => q.eq('ip_address', clientIP).gt('created_at', minAgo)),
    ])

    // Silently accept-but-drop over-limit submissions (never block the UI).
    if (ipLastMin >= PER_IP_PER_MIN || ipToday >= PER_IP_PER_DAY) {
      return json({ ok: true, stored: false })
    }

    await supabase.from('request_logs').insert({ ip_address: clientIP, function_name: 'chat_feedback' })

    const { error } = await supabase.from('chat_feedback').insert({
      session_id: sessionId,
      rating,
      comment: comment || null,
      message_count: messageCount,
      transcript: transcript.length ? transcript : null,
      ip_address: clientIP,
    })
    if (error) throw error

    return json({ ok: true, stored: true })
  } catch (error) {
    console.error('chat-feedback function error:', error)
    return json({ ok: false, error: (error as Error).message }, 500)
  }
})
