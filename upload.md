---
layout: default
title: Upload
---

<h2>Authorize with Strava</h2>

<!-- Button to initiate Strava login -->
<button onclick="loginWithStrava()">Login with Strava</button>

<h2>Upload a Workout Image</h2>

<!-- Form for image upload -->
<form id="uploadForm">
  <label for="imageInput">Choose an image:</label>
  <input type="file" id="imageInput" name="image" required>
  <button type="button" onclick="uploadImage()">Upload Image</button>
</form>

<!-- Display area for output -->
<div id="result"></div>

<script>
  // Function to handle Strava login and redirect
  async function loginWithStrava() {
    const response = await fetch('/.netlify/functions/get-client-id');
    const data = await response.json();
    const clientId = data.clientId;
    const redirectUri = "https://warm-mandazi-6b7218.netlify.app/.netlify/functions/strava-auth";

    const stravaUrl = `https://www.strava.com/oauth/authorize?client_id=${clientId}&response_type=code&redirect_uri=${redirectUri}&scope=activity:write,read_all`;
    window.location.href = stravaUrl;
  }

  // Store access token from URL in localStorage
  window.onload = function() {
    const urlParams = new URLSearchParams(window.location.search);
    const accessToken = urlParams.get('access_token');
    if (accessToken) {
      localStorage.setItem('strava_access_token', accessToken);
      window.history.replaceState({}, document.title, "/upload"); // Clean the URL
    }
  };

  // Function to upload image to imgbb and then process it
  async function uploadImage() {
    const imageInput = document.getElementById('imageInput').files[0];
    if (!imageInput) {
      document.getElementById('result').innerText = "Please select an image to upload.";
      return;
    }

    // Retrieve access token from localStorage
    const accessToken = localStorage.getItem('strava_access_token');
    if (!accessToken) {
      document.getElementById('result').innerText = "Please log in with Strava first.";
      return;
    }

    try {
      // Fetch imgbb API key
      const keyResponse = await fetch('/.netlify/functions/get-imgbb-key');
      const keyData = await keyResponse.json();
      const apiKey = keyData.apiKey;

      // Prepare and upload image to imgbb
      const formData = new FormData();
      formData.append("key", apiKey);
      formData.append("image", imageInput);

      const imgbbResponse = await fetch("https://api.imgbb.com/1/upload", {
        method: "POST",
        body: formData,
      });
      const imgbbData = await imgbbResponse.json();

      if (imgbbData.success) {
        const uploadedImageUrl = imgbbData.data.url;
        
        // Display the Strava token and image URL to the result div
        document.getElementById('result').innerText = `Strava Access Token: ${accessToken}\nImage URL: ${uploadedImageUrl}`;

        // Call processImage function to further process the image
        await processImage(uploadedImageUrl, accessToken);
      } else {
        document.getElementById('result').innerText = "Error uploading image to imgbb.";
      }
    } catch (error) {
      console.error("Error uploading image:", error);
      document.getElementById('result').innerText = "Error occurred during upload.";
    }
  }

  // Function to process the image through the Netlify function
  async function processImage(imageUrl, accessToken) {
    try {
      const response = await fetch('/.netlify/functions/process-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageUrl, accessToken })
      });

      const result = await response.json();
      if (result.activity_url) {
        document.getElementById('result').innerHTML += `
          <p>${result.message}</p>
          <p><a href="${result.activity_url}" target="_blank">View your activity on Strava</a></p>
        `;
      } else {
        document.getElementById('result').innerText += "\nError: " + (result.error || "Unknown error occurred.");
      }
    } catch (error) {
      console.error("Error processing image:", error);
      document.getElementById('result').innerText += "\nError occurred during image processing.";
    }
  }
</script>

