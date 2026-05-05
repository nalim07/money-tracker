import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface IngestPayload {
  token?: string;
  subject?: string;
  body?: string;
  source?: string; // e.g., "BCA", "Line Bank", "Jago"
  amount?: number | string;
  date?: string; // ISO string preferred
  type?: "income" | "expense"; // optional, will auto-detect if missing
  description?: string;
  wallet_name?: string; // optional, default from source
}

function parseIdrAmount(text: string | undefined): number | null {
  if (!text) return null;
  // Try to find patterns like "IDR 100,000.00" or "Rp 100.000,00"
  const m = text.match(/(?:IDR|Rp)\s*([\d.,]+)/i);
  if (m && m[1]) {
    const raw = m[1];
    // Heuristic: strip all non-digits, treat as integer amount of rupiah
    const digits = raw.replace(/[^\d]/g, "");
    if (digits) return parseInt(digits, 10);
  }
  // Fallback: any big number in text
  const n = text.match(/\b(\d{1,3}(?:[.,]\d{3}){1,4})(?:[.,]\d{2})?\b/);
  if (n && n[1]) {
    const digits = n[1].replace(/[^\d]/g, "");
    if (digits) return parseInt(digits, 10);
  }
  return null;
}

function detectType(subject?: string, body?: string): "income" | "expense" {
  const txt = `${subject ?? ""} ${body ?? ""}`.toLowerCase();
  const incomeHints = ["transaksi masuk", "deposit", "diterima", "incoming", "kredit"];
  const expenseHints = ["transaksi keluar", "pembayaran", "bayar", "paid", "debit", "tarik", "transfer keluar"];
  if (incomeHints.some((w) => txt.includes(w))) return "income";
  if (expenseHints.some((w) => txt.includes(w))) return "expense";
  // Heuristic: if "bayar" or "payment" in text → expense
  if (/[\sb]ayar|payment|tagihan/.test(txt)) return "expense";
  return "expense"; // default safe
}

function toDateOnly(dateStr?: string, fallbackNow = true): string {
  if (!dateStr) {
    if (!fallbackNow) return "";
    const d = new Date();
    // Convert to Asia/Jakarta (UTC+7) date
    const utc = new Date(d.getTime() + (7 * 60 + d.getTimezoneOffset()) * 60000);
    return utc.toISOString().slice(0, 10);
  }
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return toDateOnly(undefined, true);
  return d.toISOString().slice(0, 10);
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (req.method !== "POST") {
      return new Response(JSON.stringify({ error: "Method not allowed" }), {
        status: 405,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const payload: IngestPayload = await req.json();

    const ingestToken = Deno.env.get("EMAIL_INGEST_TOKEN");
    if (!ingestToken) {
      console.error("EMAIL_INGEST_TOKEN not set");
      return new Response(JSON.stringify({ error: "Server not configured" }), {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    if (!payload.token || payload.token !== ingestToken) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const serviceRole = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const ownerEmail = Deno.env.get("OWNER_EMAIL");
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "https://txrkimtlugynnezdbrnw.supabase.co";

    if (!serviceRole || !ownerEmail) {
      console.error("Missing required secrets: SUPABASE_SERVICE_ROLE_KEY or OWNER_EMAIL");
      return new Response(JSON.stringify({ error: "Server not configured" }), {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const supabase = createClient(supabaseUrl, serviceRole, {
      auth: { persistSession: false },
    });

    // 1) Resolve user_id via profiles by OWNER_EMAIL
    const { data: profile, error: profileErr } = await supabase
      .from("profiles")
      .select("id, email")
      .eq("email", ownerEmail)
      .maybeSingle();

    if (profileErr || !profile) {
      console.error("Profile lookup failed", profileErr);
      return new Response(JSON.stringify({ error: "Owner profile not found. Please login once to create profile." }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const userId = profile.id as string;

    // 2) Determine core fields
    const source = payload.source || "Gmail";
    const walletName = payload.wallet_name || source;
    const type = payload.type || detectType(payload.subject, payload.body);

    let amount: number | null = null;
    if (typeof payload.amount === "number") amount = payload.amount;
    if (typeof payload.amount === "string") {
      const cleaned = payload.amount.replace(/[^\d]/g, "");
      amount = cleaned ? parseInt(cleaned, 10) : null;
    }
    if (amount === null) amount = parseIdrAmount(payload.body || payload.subject || "");

    const date = toDateOnly(payload.date, true);

    const description = (payload.description || payload.subject || `${source} auto-ingest`).slice(0, 200);

    // 3) Ensure wallet exists (by name)
    const { data: existingWallet, error: wSelErr } = await supabase
      .from("wallets")
      .select("id, name")
      .eq("user_id", userId)
      .eq("name", walletName)
      .maybeSingle();

    if (wSelErr && wSelErr.code !== "PGRST116") {
      console.error("Wallet select error", wSelErr);
    }

    let walletId: string | null = existingWallet?.id ?? null;

    if (!walletId) {
      const { data: newWallet, error: wInsErr } = await supabase
        .from("wallets")
        .insert([
          {
            user_id: userId,
            name: walletName,
            // Minimal defaults
            color: "#6b7280",
            icon: "wallet",
          },
        ])
        .select("id")
        .single();

      if (wInsErr) {
        console.error("Wallet insert error", wInsErr);
        return new Response(JSON.stringify({ error: "Failed to ensure wallet" }), {
          status: 500,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        });
      }
      walletId = newWallet.id as string;
    }

    if (amount === null || isNaN(amount)) {
      return new Response(JSON.stringify({ error: "Amount not found in email" }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    // 4) Insert transaction
    const categoryText = type === "income" ? "Transaksi Masuk" : "Transaksi Keluar";

    const { data: inserted, error: tErr } = await supabase
      .from("transactions")
      .insert([
        {
          user_id: userId,
          type,
          amount,
          description,
          category: categoryText,
          wallet: walletId, // app expects wallet id as text
          date,
        },
      ])
      .select("id")
      .single();

    if (tErr) {
      console.error("Transaction insert error", tErr);
      return new Response(JSON.stringify({ error: "Failed to insert transaction" }), {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    return new Response(JSON.stringify({ ok: true, id: inserted.id }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (e) {
    console.error("email-ingest error", e);
    return new Response(JSON.stringify({ error: "Unexpected server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
});
