export async function sendN8nEmail(data: {
  action: "verify_email" | "reset_password";
  email: string;
  name?: string;
  link: string;
}) {
  const webhookUrl = process.env.N8N_WEBHOOK_URL;
  
  if (!webhookUrl) {
    console.warn("⚠️ N8N_WEBHOOK_URL non défini dans .env, l'email ne sera pas envoyé.", data);
    return false;
  }

  try {
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      console.error("Erreur lors de l'envoi au webhook n8n:", response.statusText);
      return false;
    }
    return true;
  } catch (error) {
    console.error("Erreur réseau vers le webhook n8n:", error);
    return false;
  }
}
