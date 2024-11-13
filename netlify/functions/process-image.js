// netlify/functions/process-image.js

const axios = require("axios");
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

exports.handler = async (event) => {
  try {
    const { imageUrl, accessToken } = JSON.parse(event.body);

    if (!imageUrl) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Missing image URL" }),
      };
    }

    // Process the image with OpenAI
    const stravaData = await generateStravaApiCall(imageUrl);

    if (stravaData) {
      // Send the activity data to Strava
      const stravaResponse = await sendToStrava(stravaData, accessToken);

      return {
        statusCode: 200,
        body: JSON.stringify({
          message: "Image processed and activity created successfully on Strava",
          strava_response: stravaResponse,
        }),
      };
    } else {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: "Failed to process image with OpenAI" }),
      };
    }
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: `Processing error: ${error.message}` }),
    };
  }
};

async function generateStravaApiCall(imageUrl) {
  const payload = {
    model: "gpt-4o-mini",
    messages: [
      {
        role: "user",
        content: [
          {
            type: "text",
            text: "This is a picture of a workout machine, the distance is in km. Use the image metadata to determine the start_date_local. Extract only available information including activity type (run or rowing), distance, elapse time, and any other relevant information in the comment. Provide a formatted JSON payload that can be sent to Strava to create an activity (https://developers.strava.com/docs/reference/#api-Activities-createActivity). Your answer should only contain the JSON",
          },
          {
            type: "image_url",
            image_url: {
              url: imageUrl,
            },
          },
        ],
      },
    ],
    max_tokens: 300,
  };

  const response = await axios.post(
    "https://api.openai.com/v1/chat/completions",
    payload,
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
    }
  );

  if (response.status === 200) {
    const responseText = response.data.choices[0].message.content;

    // Extract JSON payload from response text
    const jsonMatch = responseText.match(/\{.*\}/s);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    } else {
      console.error("Failed to extract JSON from OpenAI response.");
      return null;
    }
  } else {
    console.error("Error from OpenAI API:", response.status, response.data);
    return null;
  }
}

async function sendToStrava(stravaData, accessToken) {
  const stravaUrl = "https://www.strava.com/api/v3/activities";
  const response = await axios.post(stravaUrl, stravaData, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (response.status === 201) {
    return response.data;
  } else {
    console.error("Error from Strava API:", response.status, response.data);
    throw new Error(`Strava API error: ${response.status}`);
  }
}

