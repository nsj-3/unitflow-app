// agent-sms.js
// Sends SMS messages via Twilio
// Called when the agent needs to send urgent alerts

const TWILIO_SID   = process.env.TWILIO_ACCOUNT_SID;
const TWILIO_TOKEN = process.env.TWILIO_AUTH_TOKEN;
const TWILIO_FROM  = process.env.TWILIO_PHONE_NUMBER;

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method not allowed" };
  }

  try {
    const { to, message } = JSON.parse(event.body);

    if (!to || !message) {
      return { statusCode: 400, body: JSON.stringify({ error: "Missing to or message" }) };
    }

    if (!TWILIO_SID || !TWILIO_TOKEN || !TWILIO_FROM) {
      return { statusCode: 500, body: JSON.stringify({ error: "Twilio credentials not configured" }) };
    }

    const body = new URLSearchParams({
      From: TWILIO_FROM,
      To: to,
      Body: message,
    });

    const response = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_SID}/Messages.json`,
      {
        method: "POST",
        headers: {
          "Authorization": "Basic " + Buffer.from(`${TWILIO_SID}:${TWILIO_TOKEN}`).toString("base64"),
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: body.toString(),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Twilio error");
    }

    return {
      statusCode: 200,
      headers: { "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify({ success: true, sid: data.sid }),
    };

  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message }),
    };
  }
};
