const fetch = require("node-fetch");

exports.handler = async (event, context) => {
  const clientId = process.env.STRAVA_CLIENT_ID;
  const clientSecret = process.env.STRAVA_CLIENT_SECRET;

  // Extract the `code` parameter from the query string
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
    // Successful authorization
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
    // Authorization failed
    return {
      statusCode: response.status,
      body: JSON.stringify({ error: data })
    };
  }
};

