// netlify/functions/process-image.js

const axios = require("axios");
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

exports.handler = async (event) => {
  try {
    // Parse the request body to get imageUrl and accessToken
    const { imageUrl, accessToken } = JSON.parse(event.body);

    // Log received values to debug
    console.log("Received imageUrl:", imageUrl);
    console.log("Received accessToken:", accessToken);

    // Check if imageUrl is provided
    if (!imageUrl) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Missing image URL" }),
      };
    }

    // Process the image with OpenAI
    const stravaData = await generateStravaApiCall(imageUrl);
    
    // Log the result of OpenAI processing
    console.log("Generated Strava data:", stravaData);

    // If stravaData was successfully generated, send to Strava
    if (stravaData) {
      const stravaResponse = await sendToStrava(stravaData, accessToken);

      // Return success response with Strava's response data
      return {
        statusCode: 200,
        body: JSON.stringify({
          message: "Image processed and activity created successfully on Strava",
          strava_response: stravaResponse,
        }),
      };
    } else {
      // If stravaData generation failed, return an error
      return {
        statusCode: 500,
        body: JSON.stringify({ error: "Failed to process image with OpenAI" }),
      };
    }
  } catch (error) {
    // Log and return any unexpected error during processing
    console.error("Error during processing:", error);
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

  try {
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

    // Check if the response is successful and parse the data
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
  } catch (error) {
    console.error("Error calling OpenAI API:", error);
    return null;
  }
}

async function sendToStrava(stravaData, accessToken) {
  const stravaUrl = "https://www.strava.com/api/v3/activities";

  try {
    const response = await axios.post(stravaUrl, stravaData, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
    });

    // Check if the response is successful
    if (response.status === 201) {
      return response.data;
    } else {
      console.error("Error from Strava API:", response.status, response.data);
      throw new Error(`Strava API error: ${response.status}`);
    }
  } catch (error) {
    console.error("Error sending data to Strava:", error);
    throw error;
  }
}

