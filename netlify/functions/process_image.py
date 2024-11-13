# netlify/functions/process_image.py

import os
import json
import requests
import re

# Environment variables for OpenAI API Key
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
openai_url = "https://api.openai.com/v1/chat/completions"
openai_headers = {
    "Content-Type": "application/json",
    "Authorization": f"Bearer {OPENAI_API_KEY}",
}

def handler(event, context):
    try:
        # Parse input from event body
        body = json.loads(event["body"])
        image_url = body.get("imageUrl")
        access_token = body.get("accessToken")  # We receive it, but we won't use it yet

        if not image_url:
            return {
                "statusCode": 400,
                "body": json.dumps({"error": "Missing image URL"})
            }

        # Step 1: Generate the Strava API call data from the image
        strava_api_call_text = generate_strava_api_call(image_url)

        # Step 2: Parse and return data
        if strava_api_call_text:
            return {
                "statusCode": 200,
                "body": json.dumps({
                    "message": "Image processed successfully",
                    "strava_data": strava_api_call_text
                })
            }
        else:
            return {
                "statusCode": 500,
                "body": json.dumps({"error": "Failed to process image with OpenAI"})
            }

    except Exception as e:
        return {
            "statusCode": 500,
            "body": json.dumps({"error": str(e)})
        }

def generate_strava_api_call(image_url):
    """
    Sends the workout image to the OpenAI API and returns formatted Strava API call data.
    """
    # Construct the payload for OpenAI with the image and prompt
    payload = {
        "model": "gpt-4o-mini",
        "messages": [
            {
                "role": "user",
                "content": [
                    {
                        "type": "text",
                        "text": "This is a picture of a workout machine, the distance is in km. Extract available details and format them as a Strava API activity creation payload."
                    },
                    {
                        "type": "image_url",
                        "image_url": {
                            "url": image_url
                        }
                    }
                ]
            }
        ],
        "max_tokens": 300
    }

    # Send the request to OpenAI API
    response = requests.post(openai_url, headers=openai_headers, json=payload)

    # Check the response status and parse JSON data
    if response.status_code == 200:
        response_text = response.json()["choices"][0]["message"]["content"]
        
        # Extract JSON content from response
        json_match = re.search(r'\{.*\}', response_text, re.DOTALL)
        if json_match:
            strava_api_call_data = json_match.group(0)
            return json.loads(strava_api_call_data)
        else:
            print("Failed to extract JSON from OpenAI response.")
            return None
    else:
        print("Error from OpenAI API:", response.status_code, response.text)
        return None

