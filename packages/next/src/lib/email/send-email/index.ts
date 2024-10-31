import WelcomeEmail from "../emails/welcome";
import React from "react";
import { render } from "@react-email/components";
import { Resend } from "resend";
import { Webhook } from "standardwebhooks";
import http from "http";

const resend = new Resend(process.env.RESEND_API_KEY as string);
const hookSecret = process.env.SEND_EMAIL_HOOK_SECRET as string;

const server = http.createServer(async (req, res) => {
  if (req.method !== "POST") {
    res.writeHead(400);
    res.end("not allowed");
    return;
  }

  // Read the request body
  let payload = "";
  req.on("data", chunk => {
    payload += chunk;
  });

  req.on("end", async () => {
    try {
      const wh = new Webhook(hookSecret);
      const headers = req.headers;

      const {
        user,
        email_data: { email_action_type },
      } = wh.verify(payload, headers) as {
        user: {
          email: string;
        };
        email_data: {
          token: string;
          token_hash: string;
          redirect_to: string;
          email_action_type: string;
          site_url: string;
          token_new: string;
          token_hash_new: string;
        };
      };

      switch (email_action_type) {
        case "signup": {
          const html = await render(React.createElement(WelcomeEmail));

          await resend.emails.send({
            from: "Create v1 <onboarding@resend.dev>",
            to: [user.email],
            subject: "Welcome to v1",
            html,
          });

          break;
        }

        default:
          throw new Error("Invalid email action type");
      }

      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({}));
    } catch (error: any) {
      res.writeHead(500);
      res.end(JSON.stringify({ error: error.message }));
    }
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});