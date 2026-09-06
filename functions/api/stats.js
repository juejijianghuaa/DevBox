export async function onRequestGet(context) {
  const kv = context.env.DEVBOX_STATS;
  let total = 0;
  if (kv) {
    const val = await kv.get("site_total_views");
    total = val ? parseInt(val, 10) || 0 : 0;
  }
  return new Response(JSON.stringify({ total }), {
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-store",
    },
  });
}

export async function onRequestPost(context) {
  const kv = context.env.DEVBOX_STATS;
  let total = 0;
  if (kv) {
    const val = await kv.get("site_total_views");
    total = (val ? parseInt(val, 10) || 0 : 0) + 1;
    await kv.put("site_total_views", total.toString());
  }
  return new Response(JSON.stringify({ total }), {
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-store",
    },
  });
}
