import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: CORS });
  }

  const authHeader = req.headers.get("Authorization");
  if (!authHeader) return json({ error: "Não autorizado" }, 401);

  const anon = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_ANON_KEY")!,
    { global: { headers: { Authorization: authHeader } } },
  );

  const { data: { user } } = await anon.auth.getUser();
  if (!user) return json({ error: "Não autorizado" }, 401);

  const { data: admCheck } = await anon
    .from("adm_sistema")
    .select("usuario_id")
    .eq("usuario_id", user.id)
    .maybeSingle();

  if (!admCheck) {
    return json({ error: "Apenas ADM pode excluir usuários" }, 403);
  }

  const { userId } = await req.json();
  if (!userId) return json({ error: "userId é obrigatório" }, 400);

  const admin = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  const { error } = await admin.auth.admin.deleteUser(userId);
  if (error) return json({ error: error.message }, 400);

  return new Response(null, { status: 204, headers: CORS });
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS, "Content-Type": "application/json" },
  });
}
