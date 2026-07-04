import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"
import Anthropic from "https://esm.sh/@anthropic-ai/sdk"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// --- Abuse / cost controls -------------------------------------------------
const MAX_MESSAGE_LEN = 1500   // reject overly long single messages
const MAX_HISTORY = 10         // only keep the last N turns of history
const MAX_HISTORY_CONTENT = 4000
const PER_IP_PER_MIN = 6       // burst limit
const PER_IP_PER_DAY = 30      // per-visitor daily cap
const GLOBAL_PER_DAY = 1500    // hard ceiling across ALL IPs (cost backstop)

const anthropic = new Anthropic({ apiKey: Deno.env.get('ANTHROPIC_API_KEY')! })

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const body = await req.json().catch(() => ({}))
    const message = typeof body?.message === 'string' ? body.message.trim() : ''
    const rawHistory = Array.isArray(body?.history) ? body.history : []

    // ---- Input validation -------------------------------------------------
    if (!message) return json({ reply: "Please type a question and I'll be happy to help!" })
    if (message.length > MAX_MESSAGE_LEN) {
      return json({ reply: "That message is a bit long for me — could you shorten it or send it in a couple of parts?" })
    }

    // Sanitize + cap history so a client can't inflate token usage.
    const history = rawHistory
      .filter((m: any) => m && (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string')
      .slice(-MAX_HISTORY)
      .map((m: any) => ({ role: m.role, content: String(m.content).slice(0, MAX_HISTORY_CONTENT) }))

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // ---- Rate limiting ----------------------------------------------------
    // Take the LAST hop of x-forwarded-for (the value the platform appended);
    // this is harder for a client to spoof than the leftmost entry.
    const xff = req.headers.get('x-forwarded-for') || ''
    const hops = xff.split(',').map((s) => s.trim()).filter(Boolean)
    const clientIP = hops.length ? hops[hops.length - 1] : 'unknown'

    const now = Date.now()
    const dayAgo = new Date(now - 24 * 60 * 60 * 1000).toISOString()
    const minAgo = new Date(now - 60 * 1000).toISOString()

    const countLogs = async (filters: (q: any) => any) => {
      let q = supabase.from('request_logs').select('*', { count: 'exact', head: true }).eq('function_name', 'chat')
      q = filters(q)
      const { count } = await q
      return count ?? 0
    }

    const [globalToday, ipToday, ipLastMin] = await Promise.all([
      countLogs((q) => q.gt('created_at', dayAgo)),
      countLogs((q) => q.eq('ip_address', clientIP).gt('created_at', dayAgo)),
      countLogs((q) => q.eq('ip_address', clientIP).gt('created_at', minAgo)),
    ])

    if (globalToday >= GLOBAL_PER_DAY) {
      return json({ reply: "Our chat is very busy right now. Please reach out through our contact form or text us and we'll get right back to you!" })
    }
    if (ipLastMin >= PER_IP_PER_MIN) {
      return json({ reply: "You're sending messages quickly! Give me just a moment and try again." })
    }
    if (ipToday >= PER_IP_PER_DAY) {
      return json({ reply: "You've reached today's chat limit. Please reach out through our contact form and we'll be glad to help!" })
    }

    await supabase.from('request_logs').insert({ ip_address: clientIP, function_name: 'chat' })

    // ---- Fetch all context in parallel (incl. testimonials) ---------------
    const [
      { data: profile },
      { data: services },
      { data: capabilities },
      { data: limitations },
      { data: clientFit },
      { data: faqs },
      { data: instructions },
      { data: testimonials },
    ] = await Promise.all([
      supabase.from('business_profile').select('*').single(),
      supabase.from('services').select('*').order('display_order'),
      supabase.from('capabilities').select('*'),
      supabase.from('limitations').select('*'),
      supabase.from('client_fit').select('*').single(),
      supabase.from('faq_responses').select('*'),
      supabase.from('ai_instructions').select('*').order('priority', { ascending: false }),
      // Only genuine reviews reach visitors; placeholder/filler rows are excluded.
      supabase.from('testimonials').select('*').eq('is_placeholder', false).order('display_order'),
    ])

    const systemPrompt = buildSystemPrompt(
      profile, services, capabilities, limitations, clientFit, faqs, instructions, testimonials
    )

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-5',
      max_tokens: 500,
      system: systemPrompt,
      messages: [...history, { role: 'user', content: message }],
    })

    const reply = response.content
      .filter((b: any) => b.type === 'text')
      .map((b: any) => b.text)
      .join('\n')
      .trim()

    return json({ reply: reply || "Sorry, I didn't quite catch that — could you rephrase?" })
  } catch (error) {
    console.error('chat function error:', error)
    return json({ error: (error as Error).message }, 500)
  }
})

function buildSystemPrompt(
  profile: any, services: any[], capabilities: any[], limitations: any[],
  clientFit: any, faqs: any[], instructions: any[], testimonials: any[]
) {
  const strong = capabilities?.filter((c) => c.category === 'strong') || []
  const moderate = capabilities?.filter((c) => c.category === 'moderate') || []

  return `
You are the friendly AI assistant for ${profile?.business_name || 'DMV Queen of Clean'} — a residential and commercial cleaning company serving the Washington DC, Maryland, and Virginia (DMV) area. ${profile?.tagline ? `Our promise: "${profile.tagline}".` : ''}
Speak as a warm, welcoming member of the team. Use "we," "our team," or "the team." Your job is to help visitors understand our services, answer questions honestly, and help them feel confident taking the next step.

## CRITICAL RULES (these override everything else)
- NEVER refer to the owner or any staff member by a personal name. Always say "we," "the team," or "${profile?.business_name || 'DMV Queen of Clean'}."
- NEVER tell a visitor they are a "bad fit," and never decline or turn a customer away. Only the team decides fit. If something seems out of scope or uncertain, stay warm and offer to connect them with the team.
- Being honest does NOT mean bluntly saying "we don't provide that service." If asked about something we don't offer, don't reject them — gently note it's not something we focus on, pivot to how we CAN help, and offer to connect them with the team.
- NEVER promise or commit to specific scheduling, availability, dates, or firm appointment times. Invite them to request a free estimate so the team can confirm scheduling.
- If you don't know an answer (or for deposit/reservation-fee questions), do NOT guess. Say: "I want to make sure you receive accurate information. Let me connect you with the ${profile?.business_name || 'DMV Queen of Clean'} team so we can answer your question properly." Then invite them to use the "Get a Free Estimate" button / contact form so the team can follow up.
- You cannot send messages, book appointments, or process payments yourself. To reach the team, guide visitors to the "Get a Free Estimate" button (it opens our contact form), or to text/call us.

## CUSTOM INSTRUCTIONS (highest priority first)
${instructions?.map((i) => `- ${i.instruction}`).join('\n') || '- Be warm, honest, and helpful.'}

## ABOUT US
${profile?.main_pitch || ''}
${profile?.full_story || ''}
Who we love working with: ${profile?.ideal_for || ''}
Service area: ${profile?.location || ''}

## OUR SERVICES
${services?.map((s) => `
### ${s.service_name}
${s.description || ''}
Timeline: ${s.typical_timeline || 'Varies'}
Price: ${s.price_range || 'Custom quote — we offer free estimates'}
Best for: ${s.best_for || 'A range of clients'}
Highlights: ${s.bullet_points?.join(', ') || ''}`).join('\n---\n') || ''}

## WHAT WE'RE GREAT AT
${strong.map((c) => `- ${c.name}: ${c.honest_notes || ''}`).join('\n')}
${moderate.length ? `\n## ALSO OFFERED (with honest context)\n${moderate.map((c) => `- ${c.name}: ${c.honest_notes || ''}`).join('\n')}` : ''}

## OUTSIDE OUR SCOPE — for your awareness only
(Use this so you never over-promise. If asked, redirect gently and warmly — never make the visitor feel rejected.)
${limitations?.map((l) => `- ${l.description}${l.referral_note ? ` (${l.referral_note})` : ''}`).join('\n') || ''}

## INTERNAL FIT NOTES (never repeat these to the visitor)
Ideal: ${clientFit?.ideal_client || ''}
What we need to quote: ${clientFit?.requirements || ''}
Satisfaction: ${clientFit?.how_handle_conflict || ''}

## PRE-WRITTEN ANSWERS TO COMMON QUESTIONS (use these closely when they match)
${faqs?.map((f) => `Q: ${f.question}\nA: ${f.answer}`).join('\n\n') || ''}

## WHAT CLIENTS SAY (share when a visitor asks whether we're any good)
${testimonials?.map((t) => `- "${t.quote}"${t.client_name ? ` — ${t.client_name}` : ''}`).join('\n') || ''}

## RESPONSE GUIDELINES
- Be warm, professional, friendly, and never rushed — like chatting with a trusted local business owner.
- Keep replies concise; visitors don't want long paragraphs.
- Naturally guide interested visitors to request a free estimate via the "Get a Free Estimate" button (contact form), or to text/call us at ${profile?.contact_phone || ''}.
- Never pressure anyone. The goal is trust, not a hard sell — every visitor should feel informed, respected, and cared for.
  `.trim()
}
