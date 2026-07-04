# Nodemailer Service — Add SMS Notification to `/feedback`

Instructions for the **Vercel nodemailer repo** (the service behind `VITE_API_URL`) — the one that already handles the DMV Queen of Clean contact form's `/feedback` (and `/subscribe`) endpoints.

**Goal:** When a visitor submits the contact/booking form (which the AI chat routes them to for bookings and escalations), send Anitra a short **text message** via her carrier's email‑to‑SMS gateway, in addition to the existing email. Also make sure the primary email goes to **dmvqueenclean@gmail.com**.

> This repo change is only the *notification* piece. The chat itself routes bookings/escalations into the existing contact form, so no new endpoint is required — we're just adding a second, short outbound message on the `/feedback` handler.

> **⚠️ IMPORTANT — if anything is unclear, ASK; do not guess.** This doc is written
> generically and may not exactly match this repo. Before changing code, if the
> framework, the existing nodemailer transporter/auth, the `from`/`to` env-var
> names, or where/whether the main email currently goes to
> `dmvqueenclean@gmail.com` differ from what's described here, **STOP and ask the
> user for clarification** rather than assuming. A wrong guess about the
> transporter or recipient could break the working contact form. Also do not
> change the existing `/feedback` behavior beyond adding the optional SMS ping.

---

## What to change (design)

On a successful `/feedback` submission, after the existing email is sent:

1. **Confirm the primary recipient** is `dmvqueenclean@gmail.com` (env var below).
2. **Send a second, separate, short plain‑text email** to the carrier SMS gateway address (e.g. `5551234567@tmomail.net`). Keep it tiny — email‑to‑SMS truncates and strips HTML.

Do **not** just CC the gateway on the main HTML email — the SMS would arrive as unreadable markup. Send a dedicated short message instead.

---

## Environment variables to add

Add these in the Vercel project settings (and `.env` for local):

```env
# Primary lead recipient
BUSINESS_EMAIL=dmvqueenclean@gmail.com

# Email-to-SMS gateway for the owner's phone. Leave BLANK to disable SMS.
# Format: <10-digit-number>@<carrier-gateway>
# DMV Queen of Clean → number 202-821-7275 on T-Mobile:
SMS_GATEWAY_EMAIL=2028217275@tmomail.net
```

Making `SMS_GATEWAY_EMAIL` optional (blank = skip) means the SMS step can be turned on/off without a code change, and won't break anything before we have Anitra's number/carrier.

---

## Carrier gateway reference

| Carrier | Gateway (SMS) | Example |
|---|---|---|
| T‑Mobile | `@tmomail.net` | `2028217275@tmomail.net` |
| Verizon | `@vtext.com` | `2028217275@vtext.com` |
| AT&T | `@txt.att.net` | `2028217275@txt.att.net` |
| Sprint (now T‑Mobile) | `@messaging.sprintpcs.com` | — |
| US Cellular | `@email.uscc.net` | — |
| Boost | `@sms.myboostmobile.com` | — |
| Cricket | `@sms.cricketwireless.net` | — |
| Metro by T‑Mobile | `@mymetropcs.com` | — |

> ⚠️ **Best‑effort only.** Carrier email‑to‑SMS is unauthenticated and some carriers are deprecating it, so delivery isn't guaranteed. The email to `BUSINESS_EMAIL` remains the reliable channel; the SMS is a convenience ping. (True real‑time SMS via a provider like Twilio is a possible future upgrade.)

---

## Reference implementation

Adapt to the repo's actual structure (Express route vs. Vercel serverless function). Assuming a nodemailer `transporter` already exists for the main email:

```js
// After the existing "send main email" call succeeds:

// 1) Primary lead email — make sure the recipient is BUSINESS_EMAIL
//    (this is likely already wired; just confirm the `to:` uses the env var)
//    to: process.env.BUSINESS_EMAIL,

// 2) Short SMS-gateway notification (optional, only if configured)
if (process.env.SMS_GATEWAY_EMAIL) {
  const { firstName = '', lastName = '', phone = '', serviceType = '', message = '' } = req.body;
  const smsText =
    `New request: ${firstName} ${lastName}`.trim() +
    (phone ? ` | ${phone}` : '') +
    (serviceType ? ` | ${serviceType}` : '') +
    (message ? ` | ${message.slice(0, 120)}` : '');

  try {
    await transporter.sendMail({
      from: process.env.MAIL_FROM,        // reuse whatever the main email uses
      to: process.env.SMS_GATEWAY_EMAIL,
      subject: '',                        // keep empty/short — many gateways prepend it
      text: smsText.slice(0, 300),        // hard cap; SMS is short
    });
  } catch (err) {
    // Never fail the request just because the SMS ping failed.
    console.error('SMS gateway notification failed:', err);
  }
}
```

Key points:
- **Wrap the SMS send in its own try/catch** so a gateway failure never breaks the form submission or blocks the primary email.
- **Plain `text` only**, no HTML, no images, hard‑capped length.
- Guard on `SMS_GATEWAY_EMAIL` so it's a no‑op until configured.

---

## Test checklist

- [ ] Submit the contact form with `SMS_GATEWAY_EMAIL` **blank** → main email still arrives at `dmvqueenclean@gmail.com`, no errors.
- [ ] Set `SMS_GATEWAY_EMAIL` to your **own** phone/carrier first → submit → confirm you get a readable text.
- [ ] Switch `SMS_GATEWAY_EMAIL` to Anitra's number/carrier once known.
- [ ] Force a transporter error on the SMS send → confirm the form still returns success and the main email is unaffected.

---

## If you'd like me to produce exact diffs instead of this generic version

Have the other repo's agent send me:
1. The **`/feedback` handler** file (path + full code).
2. How the **nodemailer transporter** is created (transport/auth, and the `MAIL_FROM`/`to` env var names).
3. The **current recipient** config (is it already `dmvqueenclean@gmail.com` or something else?).
4. Framework: **Express app** or **Vercel serverless functions** (`api/…`)?

With those four, I'll write precise, copy‑paste edits for that repo instead of this adapt‑as‑needed template.
```
