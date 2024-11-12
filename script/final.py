import requests
import os
import argparse
import json
import re

# Ensure the OpenAI API key and Strava Access Token are set
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
STRAVA_ACCESS_TOKEN = os.getenv("STRAVA_ACCESS_TOKEN")
if not OPENAI_API_KEY:
    raise ValueError("Please set your OpenAI API key in the environment variable 'OPENAI_API_KEY'")
if not STRAVA_ACCESS_TOKEN:
    raise ValueError("Please set your Strava access token in the environment variable 'STRAVA_ACCESS_TOKEN'")

# Define API endpoints
openai_url = "https://api.openai.com/v1/chat/completions"
strava_url = "https://www.strava.com/api/v3/activities"

# Headers for OpenAI and Strava APIs
openai_headers = {
    "Content-Type": "application/json",
    "Authorization": f"Bearer {OPENAI_API_KEY}",
}
strava_headers = {
    "Authorization": f"Bearer {STRAVA_ACCESS_TOKEN}",
    "Content-Type": "application/json",
}

def generate_strava_api_call(image_url):
    """
    Sends the workout image to the OpenAI API and returns formatted Strava API call data.
    """
    # Construct the payload with the refined prompt
    payload = {
        "model": "gpt-4o-mini",
        "messages": [
            {
                "role": "user",
                "content": [
                    {
                        "type": "text",
                        "text": "This is a picture of a workout machine, the distance is in km. Use the image metadata to determine the start_date_local. Extract only available information including activity type (run or rowing), distance, elapse time, and any other relevant information in the comment. Provide a formatted JSON payload that can be sent to Strava to create an activity (https://developers.strava.com/docs/reference/#api-Activities-createActivity). Your answer should only contain the JSON."
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
        
        # Print the raw response from OpenAI for inspection
        print("OpenAI Response:", response_text)
        
        # Extract JSON content from response using regex
        json_match = re.search(r'\{.*\}', response_text, re.DOTALL)
        if json_match:
            strava_api_call_data = json_match.group(0)
            return strava_api_call_data
        else:
            print("Failed to extract JSON from OpenAI response.")
            return None
    else:
        print("Error from OpenAI API:", response.status_code, response.text)
        return None

def prepare_activity_data(activity_data):
    """
    Prepares and corrects activity data to meet Strava's API requirements.
    """
    # Correct the activity type if necessary
    if activity_data.get("type") == "treadmill":
        activity_data["type"] = "Run"  # Or "Workout" depending on preference

    return activity_data

def add_activity_to_strava(activity_data):
    """
    Sends a POST request to the Strava API to create a new activity with the provided data.
    """
    # Send the POST request to Strava API
    response = requests.post(strava_url, headers=strava_headers, json=activity_data)

    # Check the response and print result
    if response.status_code == 201:
        activity = response.json()
        print("Activity successfully created on Strava!")
        print("Response:", activity)
    else:
        print("Error from Strava API:", response.status_code, response.text)

if __name__ == "__main__":
    # Set up argument parsing for the image URL
    parser = argparse.ArgumentParser(description="Generate a Strava API call from a workout machine image and add the activity to Strava.")
    parser.add_argument("image_url", help="URL of the workout machine image")

    args = parser.parse_args()

    # Step 1: Generate the Strava API call data from the image
    strava_api_call_text = generate_strava_api_call(args.image_url)

    # Step 2: Parse the generated Strava API call JSON data
    if strava_api_call_text:
        try:
            # Load the JSON string into a Python dictionary
            activity_data = json.loads(strava_api_call_text)

            # Prepare and correct activity data for Strava API
            activity_data = prepare_activity_data(activity_data)

            # Step 3: Send the parsed activity data to Strava
            add_activity_to_strava(activity_data)

        except json.JSONDecodeError:
            print("Failed to parse JSON data from OpenAI API response.")

