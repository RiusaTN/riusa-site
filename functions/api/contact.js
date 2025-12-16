export const onRequestGet = async () => {
  return new Response("FUNCTION OK", {
    status: 200,
    headers: {
      "Content-Type": "text/plain",
    },
  });
};

export const onRequestPost = async ({ request, env }) => {
  try {
    const data = await request.json();

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "RIUSA <noreply@mail.riusa.tn.it>",
        to: ["info@riusa.tn.it"],
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
      return new Response(errorText || "Errore invio email", {
        status: 500,
      });
    }

    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });

  } catch (err) {
    return new Response(
      JSON.stringify({ error: err?.message || "Errore server" }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  }
};
