import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { ALLOWED_SOURCES, detectType, fallbackCategoryNames, findCanonical, normalize, parseIdrAmount, toDateOnly, type TransactionType } from "./helpers.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface IngestPayload {
  token?: string;
  message_id?: string;
  subject?: string;
  body?: string;
  source?: string;
  amount?: number | string;
  date?: string;
  type?: TransactionType;
  description?: string;
  category_name?: string;
  wallet_name?: string;
}

function json(body: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", ...corsHeaders },
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  try {
    const payload = await req.json() as IngestPayload;
    const ingestToken = Deno.env.get("EMAIL_INGEST_TOKEN");
    const serviceRole = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const userId = Deno.env.get("FINANCE_USER_ID");
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "https://txrkimtlugynnezdbrnw.supabase.co";

    if (!ingestToken || !serviceRole || !userId) return json({ error: "Server not configured" }, 500);
    if (!payload.token || payload.token !== ingestToken) return json({ error: "Unauthorized" }, 401);
    if (!payload.message_id?.trim()) return json({ error: "Gmail message ID is required" }, 400);

    const source = ALLOWED_SOURCES.get(normalize(payload.source ?? ""));
    if (!source) return json({ error: "Unsupported source" }, 400);
    if (!payload.wallet_name?.trim()) return json({ error: "Kantong is required" }, 400);

    const type = payload.type ?? detectType(payload.subject, payload.body);
    if (!type) return json({ error: "Transaction type could not be determined" }, 400);

    const amount = parseIdrAmount(payload.amount ?? payload.body);
    if (!amount) return json({ error: "Amount not found or invalid" }, 400);

    const date = toDateOnly(payload.date);
    if (!date) return json({ error: "Transaction date is required and must be valid" }, 400);

    const supabase = createClient(supabaseUrl, serviceRole, { auth: { persistSession: false } });
    const [{ data: wallets, error: walletsError }, { data: categories, error: categoriesError }] = await Promise.all([
      supabase.from("wallets").select("id, name").eq("user_id", userId),
      supabase.from("categories").select("id, name, type").eq("user_id", userId),
    ]);

    if (walletsError || categoriesError) return json({ error: "Failed to resolve Kantong or category" }, 500);

    const wallet = findCanonical(wallets ?? [], payload.wallet_name);
    if (!wallet) return json({ error: "Kantong not found" }, 400);

    const typedCategories = (categories ?? []).filter((category) => category.type === type || category.type === "both");
    const fallbackNames = fallbackCategoryNames(type);
    const category = payload.category_name
      ? findCanonical(typedCategories, payload.category_name)
      : null;
    const resolvedCategory = category ?? fallbackNames
      .map((name) => findCanonical(typedCategories, name))
      .find(Boolean);

    if (!resolvedCategory) return json({ error: "Canonical category fallback not found" }, 400);

    const description = (payload.description || payload.subject || `${source} email notification`).trim().slice(0, 200);
    const { data: inserted, error: insertError } = await supabase
      .from("transactions")
      .insert({
        user_id: userId,
        type,
        amount,
        description,
        category: resolvedCategory.id,
        wallet: wallet.id,
        date,
        source: "gmail",
        source_message_id: payload.message_id.trim(),
      })
      .select("id")
      .single();

    if (insertError?.code === "23505") {
      return json({ ok: true, inserted: false, duplicate: true, resolved: { source, category: resolvedCategory.name, wallet: wallet.name } });
    }
    if (insertError) {
      console.error("email-ingest insert failed", insertError.code);
      return json({ error: "Failed to insert transaction" }, 500);
    }

    return json({
      ok: true,
      inserted: true,
      duplicate: false,
      id: inserted.id,
      resolved: { source, category: resolvedCategory.name, wallet: wallet.name, fallback_applied: !category },
    });
  } catch (error) {
    console.error("email-ingest failed", error instanceof Error ? error.message : "unknown error");
    return json({ error: "Unexpected server error" }, 500);
  }
});
