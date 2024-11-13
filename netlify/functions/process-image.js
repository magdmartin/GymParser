// netlify/functions/process-image.js
import fetch from 'node-fetch';

export async function handler(event) {
  try {
    const { imageUrl, accessToken } = JSON.parse(event.body);

    // Step 1: Send image to OpenAI for processing
    const openAiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`, // Ensure this is set in Netlify env variables
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "user",
            content: [
              {
                "type": "text",
                "text": "This is a picture of a workout machine, the distance is in km. Extract the distance, calories, time, and other relevant information."
              },
              {
                "type": "image_url",
                "image_url": {
                  "url": imageUrl
                }
              }
            ]
          }
        ],
        max_tokens: 300,
      })
    });

    if (!openAiResponse.ok) {
      throw new Error("Error from OpenAI API");
    }

    const parsedData = await openAiResponse.json();

    // Step 2: Format parsed data for Strava API
    const activityData = {
      name: parsedData.name || "Workout",
      type: parsedData.type || "Workout",
      distance: parsedData.distance || 1000,  // in meters
      elapsed_time: parsedData.elapsed_time || 1800, // in seconds
      description: parsedData.description || "Workout session from image parsing",
    };

    // Step 3: Post data to Strava API
    const stravaResponse = await fetch("https://www.strava.com/api/v3/activities", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${accessToken}`,
      },
      body: JSON.stringify(activityData)
    });

    if (!stravaResponse.ok) {
      throw new Error("Error posting to Strava API");
    }

    const stravaResult = await stravaResponse.json();
    return {
      statusCode: 200,
      body: JSON.stringify({
        message: "Activity successfully created on Strava!",
        data: stravaResult,
      })
    };
  } catch (error) {
    console.error("Error in process-image function:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    };
  }
}

