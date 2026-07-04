# Supabase Keep-Alive — Reliable Strategy (portable)

A hardened replacement for the basic "GitHub Actions pings Supabase every 5 days"
keep-alive. Written to be reusable across projects — swap the table name and secrets.

## The problem
Supabase **free-tier projects pause after ~7 days with no real database activity**.
A paused DB breaks anything that reads it (e.g. an AI chat, dynamic content). Only a
**real database request** counts as activity; `/auth/v1/health` and similar do NOT.

## What actually went wrong (findings)
The ping mechanism works fine **when it runs**. The failure was the **scheduler**, not the ping:

1. **GitHub `schedule:` cron is unreliable** — runs are frequently *delayed* and sometimes
   *silently dropped* under load. At an **every-5-days** cadence, one skipped run near the
   7-day boundary = the DB sleeps. (You can verify the DB gets touched on a manual run and
   still have it pause, because the schedule didn't fire on its own.)
2. **GitHub disables scheduled workflows after 60 days of no repo commits.** So even a
   working cron silently stops on a dormant repo.
3. **The bare `/rest/v1/` schema ping returns 401 with the new publishable API keys** and
   isn't a real query anyway — so it contributes nothing.

## The fix: layered, most → least reliable

| Layer | Mechanism | Reliability | Notes |
|---|---|---|---|
| 1. **Primary** | External always-on cron (e.g. **cron-job.org**, free) hits a real DB read | High | No GitHub flakiness, no laptop dependency |
| 2. **Backup** | GitHub Actions, **daily** (not every 5 days) | Medium | Daily = dropped runs don't matter |
| 3. **Extra** | Local **systemd timer** on a dev machine | Low–Med | Only fires when the machine is awake |
| 4. **Definitive** | **Supabase Pro ($25/mo)** — never pauses | 100% | The real answer for a live/production site |

Run **at least layers 1 + 2**. Layer 4 is the honest recommendation for anything customer-facing.

---

## Key changes vs. the original guide
1. **Cadence: every-5-days → daily.** Gives huge margin against dropped runs.
2. **Drop the `/rest/v1/` schema ping** (401 with publishable keys; not a real query). Keep:
   - the `keep_alive` RPC (returns **204**), and
   - a real table read, e.g. `?limit=1` (returns **200**) — both are genuine DB activity.
3. **Add an external always-on cron** as the primary (below).
4. **Use the anon/publishable key** in the `apikey` (and `Authorization: Bearer`) headers.

Verify both endpoints before trusting the setup:
```bash
URL="https://<project-ref>.supabase.co"; KEY="<anon-or-publishable-key>"
curl -s -o /dev/null -w "rpc:   %{http_code}\n" -X POST "$URL/rest/v1/rpc/keep_alive" \
  -H "apikey: $KEY" -H "Authorization: Bearer $KEY" -H "Content-Type: application/json" -d '{}'
curl -s -o /dev/null -w "table: %{http_code}\n" "$URL/rest/v1/<your_table>?limit=1" -H "apikey: $KEY"
# Expect: rpc: 204   table: 200
```

---

## Layer 1 — External cron (cron-job.org) — PRIMARY

1. Create a free account at **cron-job.org**.
2. **Create cronjob** →
   - **URL:** `https://<project-ref>.supabase.co/rest/v1/<your_table>?limit=1`
   - **Schedule:** daily (e.g. every day at a fixed time). Even every 2–3 days is safe; daily is safest.
   - **Advanced → Headers:** add
     - `apikey: <anon-or-publishable-key>`
     - `Authorization: Bearer <anon-or-publishable-key>`
   - Enable "notify on failure" so you hear about outages.
3. Save. This is the reliable, always-on layer that doesn't depend on GitHub or your laptop.

> The anon/publishable key is public-safe (it ships in the site's JS), so putting it in a
> cron header is fine. Never use the service_role/secret key here.

---

## Layer 2 — GitHub Actions (daily) — BACKUP

`.github/workflows/keep_alive.yml`:
```yaml
name: Supabase Keep Alive
on:
  schedule:
    - cron: '0 6 * * *'   # DAILY — not every 5 days
  workflow_dispatch: {}
jobs:
  ping_supabase:
    runs-on: ubuntu-latest
    steps:
      - name: Call keep_alive RPC function
        run: |
          curl -s -o /dev/null -w "RPC keep_alive: %{http_code}\n" -X POST \
            "${{ secrets.SUPABASE_URL }}/rest/v1/rpc/keep_alive" \
            -H "apikey: ${{ secrets.SUPABASE_ANON_KEY }}" \
            -H "Authorization: Bearer ${{ secrets.SUPABASE_ANON_KEY }}" \
            -H "Content-Type: application/json" -d '{}'
      - name: Query a live table (real DB activity)
        run: |
          STATUS=$(curl -s -o /dev/null -w "%{http_code}" \
            "${{ secrets.SUPABASE_URL }}/rest/v1/<your_table>?limit=1" \
            -H "apikey: ${{ secrets.SUPABASE_ANON_KEY }}")
          echo "Table query: $STATUS"
          [ "$STATUS" = "200" ] || echo "::warning::keep-alive returned $STATUS"
```
Requires repo secrets `SUPABASE_URL` and `SUPABASE_ANON_KEY`. Scheduled workflows only run
from the **default branch**, so merge to `main`. Test with **Run workflow**.

**60-day auto-disable:** if the repo goes quiet, GitHub disables the schedule. Mitigate by
committing at least occasionally, or with a tiny scheduled "commit keep-alive" (a local
timer that pushes a trivial commit every ~30 days — see Layer 3 pattern). With Layer 1 in
place, this is a minor concern.

---

## Layer 3 — Local systemd timer (optional extra)

`~/.local/bin/supabase-keep-alive.sh`:
```bash
#!/bin/bash
URL="https://<project-ref>.supabase.co"
KEY="<anon-or-publishable-key>"
LOG="$HOME/.local/share/supabase-keep-alive.log"
echo "[$(date)] ping" >> "$LOG"
curl -s -o /dev/null -w "table: %{http_code}\n" \
  "$URL/rest/v1/<your_table>?limit=1" -H "apikey: $KEY" >> "$LOG" 2>&1
```
```bash
chmod +x ~/.local/bin/supabase-keep-alive.sh
```

`~/.config/systemd/user/supabase-keep-alive.service`:
```ini
[Unit]
Description=Ping Supabase to keep the project awake
[Service]
Type=oneshot
ExecStart=%h/.local/bin/supabase-keep-alive.sh
```

`~/.config/systemd/user/supabase-keep-alive.timer`:
```ini
[Unit]
Description=Ping Supabase daily
[Timer]
OnCalendar=daily
Persistent=true      # run on next wake if the machine was off when due
[Install]
WantedBy=timers.target
```
```bash
systemctl --user daemon-reload
systemctl --user enable --now supabase-keep-alive.timer
systemctl --user start supabase-keep-alive.service   # test now
cat ~/.local/share/supabase-keep-alive.log
```

`Persistent=true` means a missed run fires on next boot/wake. Still, the machine must be on,
which is why this is a supplement — not the primary.

---

## Applying this to another project — checklist
- [ ] Confirm the `keep_alive()` SQL function exists (`create or replace function keep_alive() returns void as $$ begin end; $$ language plpgsql security definer;`).
- [ ] Pick a real table for the read step; replace `<your_table>` everywhere.
- [ ] Verify `rpc: 204` and `table: 200` with the curl block above (using that project's ref + anon key).
- [ ] Set up **Layer 1 (cron-job.org)** — the reliability win.
- [ ] Update the GH workflow to **daily** + drop the schema ping; add repo secrets; merge to default branch.
- [ ] (Optional) add the systemd timer.
- [ ] For anything production, budget for **Supabase Pro** to remove the pause entirely.
