// netlify/functions/strava-auth.js
import fetch from 'node-fetch';

export async function handler(event, context) {
  const clientId = process.env.STRAVA_CLIENT_ID;
  const clientSecret = process.env.STRAVA_CLIENT_SECRET;
  const code = event.queryStringParameters.code;

  const response = await fetch("https://www.strava.com/oauth/token", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      client_id: clientId,
      client_secret: clientSecret,
      code: code,
      grant_type: "authorization_code"
    })
  });

  const data = await response.json();

  if (response.ok) {
    return {
      statusCode: 302,
      headers: {
        Location: `/upload?access_token=${data.access_token}`,
      },
    };
  } else {
    return {
      statusCode: response.status,
      body: JSON.stringify({ error: data })
    };
  }
}

