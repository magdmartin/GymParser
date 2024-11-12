import fetch from 'node-fetch';

export async function handler(event, context) {
  const clientId = process.env.STRAVA_CLIENT_ID;
  const clientSecret = process.env.STRAVA_CLIENT_SECRET;
  const code = event.queryStringParameters.code;

  // Exchange the authorization code for an access token
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
      statusCode: 200,
      headers: { "Content-Type": "text/html" },
      body: `
        <html>
          <body>
            <h1>Authorization Successful</h1>
            <p>Access Token: ${data.access_token}</p>
            <p>You can now use this token to upload your workout data to Strava.</p>
          </body>
        </html>
      `
    };
  } else {
    return {
      statusCode: response.status,
      body: JSON.stringify({ error: data })
    };
  }
};

