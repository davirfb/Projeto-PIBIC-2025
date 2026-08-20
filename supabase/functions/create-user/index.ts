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
  if (!authHeader) {
    return json({ error: "Não autorizado" }, 401);
  }

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
    return json({ error: "Apenas ADM pode criar usuários" }, 403);
  }

  const { nome, email, senha, tipo, nivel_acesso, is_adm, curso_ids, matricula } =
    await req.json();

  const admin = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  const { data: { user: newUser }, error: authError } =
    await admin.auth.admin.createUser({
      email,
      password: senha,
      email_confirm: true,
    });

  if (authError || !newUser) {
    return json({ error: authError?.message ?? "Erro ao criar usuário" }, 400);
  }

  const { error: usuarioError } = await admin.from("usuarios").insert({
    id: newUser.id,
    email,
    nome,
    tipo,
    nivel_acesso: nivel_acesso ?? "padrao",
    ativo: true,
  });

  if (usuarioError) {
    await admin.auth.admin.deleteUser(newUser.id);
    return json({ error: usuarioError.message }, 400);
  }

  if (tipo === "aluno" && matricula) {
    await admin.from("alunos").insert({ usuario_id: newUser.id, matricula });
  }

  if (curso_ids?.length > 0) {
    await admin.from("usuario_cursos").insert(
      curso_ids.map((cid: string) => ({ usuario_id: newUser.id, curso_id: cid })),
    );
  }

  if (is_adm) {
    await admin.from("adm_sistema").insert({ usuario_id: newUser.id });
  }

  return json(
    {
      id: newUser.id,
      email,
      nome,
      tipo,
      nivel_acesso: nivel_acesso ?? "padrao",
      is_adm: !!is_adm,
      matricula: matricula ?? null,
      curso_ids: curso_ids ?? [],
      ativo: true,
      criado_em: new Date().toISOString(),
    },
    201,
  );
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS, "Content-Type": "application/json" },
  });
}
