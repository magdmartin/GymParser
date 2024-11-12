// get-client-id.js

exports.handler = async () => {
  return {
    statusCode: 200,
    body: JSON.stringify({ clientId: process.env.STRAVA_CLIENT_ID })
  };
};

