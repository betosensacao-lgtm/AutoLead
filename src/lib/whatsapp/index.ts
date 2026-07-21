const META_API_VERSION = "v22.0";

export async function sendWhatsAppMessage(
  to: string,
  text: string,
  phoneNumberId?: string,
  accessToken?: string
) {
  const token = accessToken ?? process.env.META_ACCESS_TOKEN;
  const phoneId = phoneNumberId ?? process.env.META_PHONE_NUMBER_ID;

  if (!token || !phoneId) {
    console.warn("[WHATSAPP] Missing credentials");
    return { success: false, error: "Missing credentials" };
  }

  try {
    const url = `https://graph.facebook.com/${META_API_VERSION}/${phoneId}/messages`;
    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to,
        type: "text",
        text: { body: text },
      }),
    });

    const data = await response.json();
    return { success: response.ok, data };
  } catch (error) {
    console.error("[WHATSAPP ERROR]", error);
    return { success: false, error: String(error) };
  }
}
