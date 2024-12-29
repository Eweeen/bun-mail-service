import Mailjet from "node-mailjet";

interface Email {
  name: string;
  subject: string;
  message: string;
}

const mailjet = new Mailjet({
  apiKey: process.env.MAILJET_KEY,
  apiSecret: process.env.MAILJET_SECRET,
});

Bun.serve({
  port: 3001,
  async fetch(req: Request) {
    // Only allow POST requests
    if (req.method !== "POST") {
      return new Response("Method not allowed", { status: 405 });
    }

    // Only allow application/json content type
    if (!req.headers.get("Content-Type")?.includes("application/json")) {
      return new Response("Content-Type must be application/json", {
        status: 400,
      });
    }

    const data: Email = await req.json();

    // Check if the request has the required fields
    if (!data.name || !data.subject || !data.message) {
      return new Response("Missing required fields", { status: 400 });
    }

    // Send the email
    const mail = await mailjet.post("send", { version: "v3.1" }).request({
      Messages: [
        {
          From: { Email: process.env.MAIL_USER, Name: process.env.MAIL_NAME },
          To: [{ Email: process.env.MAIL_USER, Name: data.name }],
          Subject: data.subject,
          HTMLPart: data.message,
        },
      ],
    });

    // If the email was not sent, send a message to a Discord webhook
    if (mail.response.status !== 200) {
      const id = process.env.WEBHOOK_ID;
      const token = process.env.WEBHOOK_TOKEN;
      const url = `https://discord.com/api/webhooks/${id}/${token}`;

      const body = JSON.stringify({
        username: "Webhook Mailjet",
        content: `**name**: ${process.env.MAIL_USER}\n**subject**: ${data.subject}\n**message**: ${data.message}`,
      });

      const config = {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body,
      };

      await fetch(url, config);
      return new Response("Error sending email", { status: 500 });
    }

    // Return a success message
    return new Response("Email sent", { status: 200 });
  },
});
