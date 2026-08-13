import { sendBereketMail } from "@vps/shared-backend/core/mail";

export async function sendEmailAlert(to: string, subject: string, html: string) {
  return sendBereketMail({ to, subject, html });
}
