// netlify/functions/process-image.js
const fetch = require("node-fetch");

exports.handler = async (event) => {
  try {
    const { imageUrl, accessToken } = JSON.parse(event.body);

    // Step 1: Send image to OpenAI for processing
    const openAiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,  // Ensure this is set in Netlify env variables
      },
      body: JSON.stringify({
        model: "gpt-4o-mini", // Replace with actual model if different
        messages: [
          {
            role: "user",
            content: [
              {
                "type": "text",
                "text": "This is a picture of a workout machine, the distance is in km. Determine what type of workout it is between treadmill and rowing machine. Extract the distance, calories, time, and any other relevant information. The results should be an API call that can be sent to Strava to create an activity."
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
    console.log("OpenAI Response:", parsedData);

    // Step 2: Format parsed data for Strava API (example response structure may vary)
    const activityData = {
      name: parsedData.name || "Workout",
      type: parsedData.type || "Workout",
      distance: parsedData.distance || 1000,  // Ensure this is in meters for Strava API
      elapsed_time: parsedData.elapsed_time || 1800, // Time in seconds
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
};

