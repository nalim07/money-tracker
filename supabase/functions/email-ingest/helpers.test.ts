import { assertEquals } from "https://deno.land/std@0.224.0/assert/mod.ts";
import { ALLOWED_SOURCES, detectType, fallbackCategoryNames, findCanonical, normalize, parseIdrAmount } from "./helpers.ts";

Deno.test("email ingest helpers only accept canonical rupiah and mappings", () => {
  assertEquals(parseIdrAmount("Rp 25.000,00"), 25000);
  assertEquals(parseIdrAmount("25.000"), null);
  assertEquals(normalize("Makan & Minum"), normalize("makan dan minum"));
  assertEquals(detectType("Notifikasi", "Dana masuk Rp 25.000"), "income");
  assertEquals(ALLOWED_SOURCES.get(normalize("HanaBank")), "Hana Bank");
  assertEquals(fallbackCategoryNames("income"), ["Pemasukan Lain", "Lainnya", "Lain-lain"]);
  assertEquals(findCanonical([{ name: "Makan & Minum" }], "makan dan minum")?.name, "Makan & Minum");
});
