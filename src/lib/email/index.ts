import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendEmail({
  to,
  subject,
  html,
  from,
}: {
  to: string;
  subject: string;
  html: string;
  from?: string;
}) {
  try {
    const data = await resend.emails.send({
      from: from ?? "AutoLead <onboarding@resend.dev>",
      to,
      subject,
      html,
    });

    return { success: true, data };
  } catch (error) {
    console.error("[EMAIL ERROR]", error);
    return { success: false, error: String(error) };
  }
}

export async function sendFollowUpEmail(
  to: string,
  subject: string,
  content: string
) {
  return sendEmail({
    to,
    subject,
    html: content,
  });
}
