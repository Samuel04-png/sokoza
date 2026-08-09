import { access, readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { createClient } from "@supabase/supabase-js";
import { THOKOZILE_EMAIL, THOKOZILE_PRODUCTS, THOKOZILE_UNUSED_ASSETS } from "./thokozile-catalog.mjs";

const root = resolve(import.meta.dirname, "..");
const dryRun = process.argv.includes("--dry-run");
const overwrite = process.argv.includes("--overwrite-store-copy");
const password = process.env.THOKOZILE_TEMP_PASSWORD;
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const secret = process.env.SUPABASE_SECRET_KEY;

const logoFile = "public/assets/thokos store /logo&cover image /ChatGPT Image Aug 9, 2026, 11_57_03 AM (1).webp";
const coverFile = "public/assets/thokos store /logo&cover image /ChatGPT Image Aug 9, 2026, 11_57_04 AM (2).webp";

function required(value, name) {
  if (!value) throw new Error(`${name} is required.`);
  return value;
}

async function findAuthUser(admin) {
  for (let page = 1; page <= 20; page += 1) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage: 100 });
    if (error) throw error;
    const user = data.users.find((candidate) => candidate.email?.toLowerCase() === THOKOZILE_EMAIL);
    if (user) return user;
    if (data.users.length < 100) return null;
  }
  throw new Error("Auth user scan exceeded the safe pagination limit.");
}

async function upload(admin, bucket, path, source) {
  const bytes = await readFile(resolve(root, source));
  for (let attempt = 1; attempt <= 4; attempt += 1) {
    const { error } = await admin.storage.from(bucket).upload(path, bytes, { contentType: "image/png", upsert: false });
    if (!error || /already exists|duplicate/i.test(error.message)) return;
    if (attempt === 4 || !/fetch failed|session has been destroyed|network|timeout/i.test(`${error.message} ${error.details ?? ""}`)) throw error;
    await new Promise((resolveDelay) => setTimeout(resolveDelay, attempt * 750));
  }
}

async function main() {
  const allImages = THOKOZILE_PRODUCTS.flatMap((item) => item.images);
  if (THOKOZILE_PRODUCTS.length !== 28 || allImages.length !== 112 || new Set(allImages).size !== 112) throw new Error("Catalog manifest count or uniqueness check failed.");
  await Promise.all([logoFile, coverFile, ...allImages, ...THOKOZILE_UNUSED_ASSETS].map((file) => access(resolve(root, file))));
  if (dryRun) {
    console.log(`Validated 28 draft products, ${allImages.length} selected product images and ${THOKOZILE_UNUSED_ASSETS.length} preserved alternate asset.`);
    return;
  }

  required(url, "NEXT_PUBLIC_SUPABASE_URL");
  required(secret, "SUPABASE_SECRET_KEY");
  required(password, "THOKOZILE_TEMP_PASSWORD");
  const admin = createClient(url, secret, { auth: { autoRefreshToken: false, persistSession: false } });

  let user = await findAuthUser(admin);
  if (!user) {
    const { data, error } = await admin.auth.admin.createUser({
      email: THOKOZILE_EMAIL,
      password,
      email_confirm: true,
      user_metadata: { full_name: "Thokozile Shanzi" },
    });
    if (error || !data.user) throw error ?? new Error("Auth user was not created.");
    user = data.user;
    console.log("Created and confirmed the seller Auth account.");
  } else {
    console.log("Seller Auth account already exists; password and metadata were preserved.");
  }

  const { error: profileError } = await admin.from("profiles").upsert({ id: user.id, full_name: "Thokozile Shanzi", role: "seller" }, { onConflict: "id" });
  if (profileError) throw profileError;
  const { error: sellerError } = await admin.from("seller_profiles").upsert({ user_id: user.id }, { onConflict: "user_id", ignoreDuplicates: true });
  if (sellerError) throw sellerError;

  const { data: city, error: cityError } = await admin.from("cities").select("id").ilike("name", "Lusaka").single();
  if (cityError || !city) throw cityError ?? new Error("Lusaka reference data is missing.");
  const storeLogoPath = `${user.id}/store/elegance-at-tkays-logo.png`;
  const storeCoverPath = `${user.id}/store/elegance-at-tkays-cover.png`;
  const { data: existingStoreMedia, error: storeMediaError } = await admin.storage.from("store-media").list(`${user.id}/store`, { limit: 100 });
  if (storeMediaError) throw storeMediaError;
  const existingStoreMediaNames = new Set(existingStoreMedia.map((item) => item.name));
  await Promise.all([
    existingStoreMediaNames.has("elegance-at-tkays-logo.webp") ? null : upload(admin, "store-media", storeLogoPath, logoFile),
    existingStoreMediaNames.has("elegance-at-tkays-cover.webp") ? null : upload(admin, "store-media", storeCoverPath, coverFile),
  ]);

  const storeValues = {
    owner_id: user.id,
    slug: "elegance-at-tkays",
    name: "Elegance @ Tkay's",
    tagline: "Easy layers, denim and occasion pieces.",
    description: "A Lusaka boutique offering photographed womenswear across denim, knit layers, dresses, shorts and sleepwear.",
    city_id: city.id,
    area: "Lusaka",
    logo_path: storeLogoPath,
    cover_path: storeCoverPath,
    category_tags: ["Cardigans", "Dresses", "Sets", "Sleepwear", "Trousers"],
    style_tags: ["Everyday", "Street ease"],
    whatsapp_e164: "",
    facebook_url: "",
    tiktok_url: "",
    collection_enabled: true,
    collection_area: "Lusaka",
    collection_details: "Collection in Lusaka by arrangement. Confirm the exact point and time with the Store before travelling.",
    delivery_enabled: true,
    delivery_scope: "within_city",
    delivery_fee_mode: "whatsapp",
    delivery_details: "Delivery may be arranged in Lusaka. Confirm availability, area, timing and fee with the Store.",
    exchange_policy: "Confirm the Store's exchange position before paying.",
    cancellation_policy: "Confirm or cancel before fulfilment arrangements are finalised.",
    reply_expectation: "Reply timing will be confirmed by the Store.",
    status: "draft",
  };
  const { data: currentStore, error: storeReadError } = await admin.from("stores").select("id, slug").eq("owner_id", user.id).maybeSingle();
  if (storeReadError) throw storeReadError;
  let store = currentStore;
  if (!store) {
    const { data, error } = await admin.from("stores").insert(storeValues).select("id, slug").single();
    if (error || !data) throw error ?? new Error("Store was not created.");
    store = data;
    console.log("Created the draft Store and uploaded its approved identity assets.");
  } else if (overwrite) {
    const { error } = await admin.from("stores").update(storeValues).eq("id", store.id);
    if (error) throw error;
    console.log("Updated Store copy because --overwrite-store-copy was explicitly provided.");
  } else {
    console.log("Store already exists; existing seller edits were preserved.");
  }

  const { data: categoryRows, error: categoryError } = await admin.from("categories").select("id, name").in("name", [...new Set(THOKOZILE_PRODUCTS.map((item) => item.category))]);
  if (categoryError) throw categoryError;
  const categories = new Map(categoryRows.map((row) => [row.name, row.id]));
  const missing = [...new Set(THOKOZILE_PRODUCTS.map((item) => item.category))].filter((name) => !categories.has(name));
  if (missing.length) throw new Error(`Missing categories: ${missing.join(", ")}. Apply migrations before importing.`);

  async function importProduct(item) {
    const slug = `${item.slug}-tkays`;
    const { data: existing, error: readError } = await admin.from("products").select("id").eq("store_id", store.id).eq("slug", slug).maybeSingle();
    if (readError) throw readError;
    if (existing) return "skipped";
    const { data: inserted, error: productError } = await admin.from("products").insert({
      store_id: store.id, category_id: categories.get(item.category), slug, title: item.title,
      description: item.description, details: item.details, condition: item.condition,
      regular_price: item.price, primary_colour: item.colour, style_tags: item.styles,
      occasion_tags: item.occasions, audience: item.audience, made_here: item.madeHere,
      featured: false, status: "draft", last_availability_confirmed_at: null,
    }).select("id").single();
    if (productError || !inserted) throw productError ?? new Error(`Could not create ${item.title}.`);

    await Promise.all(item.images.map(async (source, index) => {
      const imageRole = ["Main image", "Secondary image", "Flat isolated shot", "Detail shot"][index];
      const filename = `${String(index + 1).padStart(2, "0")}-${item.slug}.png`;
      const storagePath = `${user.id}/product/${inserted.id}/${filename}`;
      await upload(admin, "product-media", storagePath, source);
      const { error } = await admin.from("product_images").insert({ product_id: inserted.id, storage_path: storagePath, alt_text: `${item.title} — ${imageRole}`, sort_order: index, is_cover: index === 0 });
      if (error) throw error;
    }));
    const { error: variantError } = await admin.from("product_variants").insert({
      product_id: inserted.id, sku: `TKAYS-${item.slug.slice(0, 58).toUpperCase()}`, label: "Size and stock confirmation required",
      stock_quantity: 0, stock_reference_quantity: 0, availability: "unavailable", last_availability_confirmed_at: null,
    });
    if (variantError) throw variantError;
    console.log(`Created draft: ${item.title}`);
    return "created";
  }

  const outcomes = [];
  const batchSize = Number(process.env.THOKOZILE_IMPORT_BATCH_SIZE ?? "2");
  if (!Number.isInteger(batchSize) || batchSize < 1 || batchSize > 3) throw new Error("THOKOZILE_IMPORT_BATCH_SIZE must be 1, 2 or 3.");
  for (let index = 0; index < THOKOZILE_PRODUCTS.length; index += batchSize) {
    outcomes.push(...await Promise.all(THOKOZILE_PRODUCTS.slice(index, index + batchSize).map(importProduct)));
  }

  const created = outcomes.filter((outcome) => outcome === "created").length;
  const skipped = outcomes.filter((outcome) => outcome === "skipped").length;
  console.log(`Import complete: ${created} draft products created, ${skipped} existing products preserved. Store remains draft; no WhatsApp or social links were invented.`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
