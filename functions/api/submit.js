// Envia cada voto por e-mail usando Resend.
// Configure no Cloudflare: RESEND_API_KEY, EMAIL_TO e EMAIL_FROM.

const DEFAULT_TO = "COLOQUE-SEU-EMAIL-AQUI@example.com";

const json = (data, status=200) => new Response(JSON.stringify(data), {
  status, headers: {"content-type":"application/json; charset=utf-8"}
});

export async function onRequestPost(context) {
  try {
    const body = await context.request.json();
    const voterName = String(body?.voterName || "").trim();
    const voterNick = String(body?.voterNick || "").trim();
    const ranking = Array.isArray(body?.ranking) ? body.ranking : [];

    if (!voterName || !voterNick) return json({error:"Informe seu nome e nick."},400);
    if (ranking.length < 2) return json({error:"Ranking inválido."},400);
    const unique = new Set(ranking);
    if (unique.size !== ranking.length || ranking.some(x=>typeof x!=="string"||!x.trim()))
      return json({error:"O ranking contém jogadores inválidos ou repetidos."},400);

    const env=context.env||{};
    const apiKey=env.RESEND_API_KEY;
    const to=env.EMAIL_TO||DEFAULT_TO;
    const from=env.EMAIL_FROM||"Ranking <onboarding@resend.dev>";
    if(!apiKey||to.includes("COLOQUE-SEU-EMAIL"))
      return json({error:"O envio de e-mail ainda não foi configurado. Configure RESEND_API_KEY e EMAIL_TO no Cloudflare."},500);

    const date=new Date().toLocaleString("pt-BR",{timeZone:"America/Sao_Paulo",dateStyle:"short",timeStyle:"medium"});
    const lines=ranking.map((p,i)=>`${String(i+1).padStart(2,"0")}º — ${p}`).join("\n");
    const text=[
      "NOVO RANKING RECEBIDO","",`Votante: ${voterName}`,`Nick: ${voterNick}`,`Data: ${date}`,"",
      "RANKING:","",lines,"","-------------------------","Major Cachoeirense"
    ].join("\n");

    const r=await fetch("https://api.resend.com/emails",{
      method:"POST",
      headers:{"Authorization":`Bearer ${apiKey}`,"Content-Type":"application/json"},
      body:JSON.stringify({from,to:[to],subject:`Novo Ranking — Major Cachoeirense — ${voterNick}`,text})
    });
    if(!r.ok){console.error(await r.text());return json({error:"Houve erro no envio do e-mail. Verifique a configuração."},502);}
    return json({ok:true});
  } catch(e) {
    console.error(e);
    return json({error:"Erro inesperado ao processar o ranking."},500);
  }
}