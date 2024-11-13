# netlify/functions/process_image.py

import os
import json
import requests
import re

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
openai_url = "https://api.openai.com/v1/chat/completions"
openai_headers = {
    "Content-Type": "application/json",
    "Authorization": f"Bearer {OPENAI_API_KEY}",
}

def handler(event, context):
    try:
        body = json.loads(event["body"])
        image_url = body.get("imageUrl")
        access_token = body.get("accessToken")

        if not image_url:
            return {
                "statusCode": 400,
                "body": json.dumps({"error": "Missing image URL"})
            }

        strava_api_call_text = generate_strava_api_call(image_url)

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
            "body": json.dumps({"error": f"Processing error: {str(e)}"})
        }

def generate_strava_api_call(image_url):
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

    response = requests.post(openai_url, headers=openai_headers, json=payload)

    if response.status_code == 200:
        response_text = response.json()["choices"][0]["message"]["content"]
        
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

