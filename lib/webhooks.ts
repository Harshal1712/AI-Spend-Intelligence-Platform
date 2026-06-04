const SEVERITY_COLORS: Record<string, string> = {
  Low: "#2eb886",      // green
  Medium: "#f2c744",   // yellow
  High: "#f28444",     // orange
  Critical: "#e01e5a"  // red
};

export async function sendSlackAlert(
  title: string,
  body: string,
  severity: "Low" | "Medium" | "High" | "Critical"
): Promise<void> {
  const url = process.env.SLACK_WEBHOOK_URL;
  if (!url) return;

  const color = SEVERITY_COLORS[severity] ?? SEVERITY_COLORS.Low;

  const payload = {
    attachments: [
      {
        color,
        fallback: `${title}: ${body}`,
        blocks: [
          {
            type: "header",
            text: {
              type: "plain_text",
              text: title,
              emoji: true
            }
          },
          {
            type: "section",
            text: {
              type: "mrkdwn",
              text: body
            }
          },
          {
            type: "context",
            elements: [
              {
                type: "mrkdwn",
                text: `*Severity:* ${severity}  |  *Time:* ${new Date().toLocaleString("en-US", { timeZone: "UTC" })} UTC`
              }
            ]
          }
        ]
      }
    ]
  };

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      console.error(`[webhooks] Slack returned non-OK status: ${response.status} ${response.statusText}`);
    }
  } catch (error) {
    console.error("[webhooks] Failed to send Slack alert:", error);
  }
}

export async function sendTeamsAlert(
  title: string,
  body: string,
  severity: string
): Promise<void> {
  const url = process.env.MICROSOFT_TEAMS_WEBHOOK_URL;
  if (!url) return;

  const color = SEVERITY_COLORS[severity] ?? SEVERITY_COLORS.Low;

  const payload = {
    type: "message",
    attachments: [
      {
        contentType: "application/vnd.microsoft.card.adaptive",
        contentUrl: null,
        content: {
          $schema: "http://adaptivecards.io/schemas/adaptive-card.json",
          type: "AdaptiveCard",
          version: "1.4",
          body: [
            {
              type: "TextBlock",
              text: title,
              weight: "Bolder",
              size: "Large",
              color: severity === "Critical" ? "Attention" : severity === "High" ? "Warning" : "Good"
            },
            {
              type: "TextBlock",
              text: body,
              wrap: true,
              spacing: "Medium"
            },
            {
              type: "FactSet",
              facts: [
                { title: "Severity", value: severity },
                { title: "Time", value: new Date().toLocaleString("en-US", { timeZone: "UTC" }) + " UTC" }
              ]
            }
          ],
          msteams: {
            width: "Full"
          }
        }
      }
    ]
  };

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      console.error(`[webhooks] Teams returned non-OK status: ${response.status} ${response.statusText}`);
    }
  } catch (error) {
    console.error("[webhooks] Failed to send Teams alert:", error);
  }
}

export async function sendAlert(
  title: string,
  body: string,
  severity: string
): Promise<void> {
  const normalizedSeverity = (["Low", "Medium", "High", "Critical"].includes(severity)
    ? severity
    : "Low") as "Low" | "Medium" | "High" | "Critical";

  await Promise.all([
    sendSlackAlert(title, body, normalizedSeverity),
    sendTeamsAlert(title, body, severity)
  ]);
}
