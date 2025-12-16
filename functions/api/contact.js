export const onRequestGet = async () => {
  return new Response("FUNCTION OK", {
    status: 200,
    headers: { "Content-Type": "text/plain" },
  });
};

export const onRequestPost = async ({ request, env }) => {
  try {
    const data = await request.json();

    // 🛡️ Honeypot anti-bot
    // se il campo nascosto è compilato, fingiamo successo
    if (data.website) {
      return new Response(JSON.stringify({ ok: true }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "RIUSA <noreply@mail.riusa.tn.it>",
        to: ["info@riusa.tn.it"],
        reply_to: data.email, // ✅ rispondi direttamente al cliente
        subject: "Nuova richiesta dal sito RIUSA",
        html: `
          <h3>Nuova richiesta dal sito</h3>
          <p><b>Nome:</b> ${data.nome}</p>
          <p><b>Cognome:</b> ${data.cognome}</p>
          <p><b>Email:</b> ${data.email}</p>
          <p><b>Telefono:</b> ${data.telefono || "-"}</p>
          <p><b>Messaggio:</b><br>${data.messaggio}</p>
        `,
      }),
    });

    if (!res.ok) {
      const errorText = await res.text();
      return new Response(
        JSON.stringify({ ok: false, error: errorText || "Errore invio email" }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });

  } catch (err) {
    return new Response(
      JSON.stringify({ ok: false, error: err?.message || "Errore server" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
};
