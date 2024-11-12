import requests
import os
import argparse
import json

# Set the Strava Access Token from environment variables
STRAVA_ACCESS_TOKEN = os.getenv("STRAVA_ACCESS_TOKEN")
if not STRAVA_ACCESS_TOKEN:
    raise ValueError("Please set your Strava access token in the environment variable 'STRAVA_ACCESS_TOKEN'")

# Define the Strava API endpoint for creating an activity
strava_url = "https://www.strava.com/api/v3/activities"

def add_activity_to_strava(activity_data):
    """
    Sends a POST request to the Strava API to create a new activity with the provided data.
    """
    headers = {
        "Authorization": f"Bearer {STRAVA_ACCESS_TOKEN}",
        "Content-Type": "application/json",
    }

    # Send the POST request to Strava API
    response = requests.post(strava_url, headers=headers, json=activity_data)

    # Check the response and print result
    if response.status_code == 201:
        activity = response.json()
        print("Activity successfully created on Strava!")
        print("Response:", activity)
        return activity['id']  # Return the activity ID
    else:
        print("Error:", response.status_code, response.text)
        return None

def parse_strava_api_call_from_file(file_path):
    """
    Reads the API call text from a file, extracts the JSON payload, and returns it.
    """
    try:
        with open(file_path, 'r') as file:
            api_call_text = file.read()

        # Extract the JSON portion from the API call text
        json_start = api_call_text.find("{")
        json_data = json.loads(api_call_text[json_start:])
        return json_data
    except FileNotFoundError:
        print(f"Error: File not found - {file_path}")
        return None
    except json.JSONDecodeError:
        print("Error parsing JSON from the API call text.")
        return None

if __name__ == "__main__":
    # Set up argument parsing for the file containing the Strava API call text
    parser = argparse.ArgumentParser(description="Add an activity to Strava.")
    parser.add_argument("api_call_file", help="Path to the file containing the Strava API call")

    args = parser.parse_args()

    # Step 1: Read and parse the API call JSON data from the provided file
    activity_data = parse_strava_api_call_from_file(args.api_call_file)

    # Step 2: Send the parsed activity data to Strava if parsing was successful
    if activity_data:
        add_activity_to_strava(activity_data)

