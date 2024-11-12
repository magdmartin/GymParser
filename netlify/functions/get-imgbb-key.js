// netlify/functions/get-imgbb-key.js
exports.handler = async () => {
  const apiKey = process.env.IMGBB_API_KEY;
  if (!apiKey) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "API key not set in environment variables" }),
    };
  }
  return {
    statusCode: 200,
    body: JSON.stringify({ apiKey }),
  };
};

