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

export async function notifyAdminNewComment(data: {
  authorName: string;
  authorEmail: string;
  targetType: "model" | "brand";
  targetName: string;
  rating?: number;
  comment: string;
}) {
  const webhookUrl =
    process.env.N8N_COMMENT_WEBHOOK_URL ||
    process.env.N8N_TELEGRAM_WEBHOOK_URL ||
    "https://n8n.deposark.com/webhook/e86c68d1-7b6e-438c-8e6e-249256051df5";

  const ratingText = data.rating && data.rating > 0 ? `${data.rating}/5` : "Sans note";
  const summary = `Nouveau commentaire de ${data.authorName} sur ${data.targetName} : "${data.comment}" (${ratingText})`;
  const fullMessage = `💬 Nouveau commentaire à valider sur Actumoto !\n\n👤 Auteur : ${data.authorName} (${data.authorEmail})\n🏍️ Concerne : ${data.targetName}\n⭐ Note : ${ratingText}\n📝 Commentaire :\n« ${data.comment} »\n\n🔗 Validation : https://test.actumoto.tn/admin/commentaires`;

  try {
    const res = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        event: "new_comment",
        type: "Nouveau Commentaire",
        username: data.authorName,
        userEmail: data.authorEmail,
        target: data.targetName,
        rating: data.rating || 0,
        comment: data.comment,
        code: summary, // Compatible avec les scénarios n8n attendant le champ code
        message: fullMessage,
        text: fullMessage,
        expiry: "En attente de validation",
        ip: "Serveur (Actumoto)",
      }),
    });
    return res.ok;
  } catch (error) {
    console.error("Erreur lors de la notification Telegram/n8n pour le nouveau commentaire:", error);
    return false;
  }
}

