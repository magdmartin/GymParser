import requests
import os
import argparse

# Ensure the OpenAI API key is set
api_key = os.getenv("OPENAI_API_KEY")
if not api_key:
    raise ValueError("Please set your OpenAI API key in the environment variable 'OPENAI_API_KEY'")

# Define the OpenAI API endpoint and headers
url = "https://api.openai.com/v1/chat/completions"
headers = {
    "Content-Type": "application/json",
    "Authorization": f"Bearer {api_key}",
}

def generate_strava_api_call(image_url):
    """
    Sends the workout image to the OpenAI API and returns a formatted Strava API call.
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
                        "text": "This is a picture of a workout machine, the distance is in km. Determine what type of workout it is between treadmill and rowing machine. Use the image metadata to determine the start_date_local. Extract the distance, calories, time, and any other relevant information. Provide a formatted API call that can be sent to Strava to create an activity. Your answer should only contain the json do not include ```json ```"
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

    # Send the request to the OpenAI API
    response = requests.post(url, headers=headers, json=payload)

    # Check the response status and output the Strava API call
    if response.status_code == 200:
        response_json = response.json()
        strava_api_call = response_json["choices"][0]["message"]["content"]
        print(strava_api_call)
    else:
        print("Error:", response.status_code, response.text)

if __name__ == "__main__":
    # Set up argument parsing for the image URL
    parser = argparse.ArgumentParser(description="Generate a Strava API call from a workout machine image.")
    parser.add_argument("image_url", help="URL of the workout machine image")

    args = parser.parse_args()

    # Generate and print the Strava API call from the image
    generate_strava_api_call(args.image_url)

