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

/**
 * Create a response object
 * @param {string} body - The response body
 * @param {number} status - The response status
 * @returns {Response} - The response object
 */
function response(body: string, status: number): Response {
  return new Response(body, {
    status,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  });
}

Bun.serve({
  port: 3001,
  async fetch(req: Request) {
    if (req.method === "OPTIONS") {
      return new Response(null, {
        status: 204, // Ou 200
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type, Authorization",
          // Access-Control-Max-Age (facultatif)
          // pour "cacher" la réponse preflight
          // "Access-Control-Max-Age": "86400",
        },
      });
    }

    // Only allow POST requests
    if (req.method !== "POST") {
      return response("Method not allowed", 405);
    }

    // Only allow application/json content type
    if (!req.headers.get("Content-Type")?.includes("application/json")) {
      return response("Content-Type must be application/json", 400);
    }

    const data: Email = await req.json();

    // Check if the request has the required fields
    if (!data.name || !data.subject || !data.message) {
      return response("Missing required fields", 400);
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
    // if (mail.response.status !== 200) {
    const id = process.env.WEBHOOK_ID;
    const token = process.env.WEBHOOK_TOKEN;
    const url = `https://discord.com/api/webhooks/${id}/${token}`;

    const body = JSON.stringify({
      username: "Webhook Mailjet",
      content: `**name**: ${data.name}\n**subject**: ${data.subject}\n**message**: ${data.message}`,
    });

    const config = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
    };

    await fetch(url, config);
    // return response("Error sending email", 500);
    // }

    // Return a success message
    return response("Email sent", 200);
  },
});
