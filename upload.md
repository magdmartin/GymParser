---
layout: default
title: Upload
---
<h2>Authorize with Strava</h2>

First login with Strava:
<a href="https://www.strava.com/oauth/authorize?client_id={{ site.strava_client_id }}&response_type=code&redirect_uri=https://warm-mandazi-6b7218.netlify.app/.netlify/functions/strava-auth&scope=activity:write,read_all">
  <button>Login with Strava</button>
</a>


<h2>Upload a Workout Image</h2>
Then select your image for upload
<!-- Form to select an image file for upload -->
<form id="uploadForm">
  <label for="imageInput">Choose an image:</label>
  <input type="file" id="imageInput" name="image" required>
  <button type="button" onclick="uploadImage()">Upload and Process Image</button>
</form>

<!-- Authorization button for Strava login -->


<!-- Result display -->
<div id="result"></div>

<script>
  // Check URL for access token and store it in localStorage
  window.onload = function() {
    const urlParams = new URLSearchParams(window.location.search);
    const accessToken = urlParams.get('access_token');
    if (accessToken) {
      localStorage.setItem('strava_access_token', accessToken);
      window.history.replaceState({}, document.title, "/upload"); // Clean the URL
    }
  };

  async function uploadImage() {
    const imageInput = document.getElementById('imageInput').files[0];
    if (!imageInput) {
      document.getElementById('result').innerText = "Please select an image to upload.";
      return;
    }

    // Check for access token in localStorage
    const accessToken = localStorage.getItem('strava_access_token');
    if (!accessToken) {
      document.getElementById('result').innerText = "Please log in with Strava first.";
      return;
    }

    try {
      // Step 1: Retrieve imgbb API key from Netlify function
      const keyResponse = await fetch('/.netlify/functions/get-imgbb-key');
      const keyData = await keyResponse.json();
      const apiKey = keyData.apiKey;

      // Step 2: Prepare image data for upload to imgbb
      const formData = new FormData();
      formData.append("key", apiKey);
      formData.append("image", imageInput);

      // Step 3: Upload the image to imgbb
      const imgbbResponse = await fetch("https://api.imgbb.com/1/upload", {
        method: "POST",
        body: formData,
      });
      const imgbbData = await imgbbResponse.json();

      if (imgbbData.success) {
        const uploadedImageUrl = imgbbData.data.url;
        document.getElementById('result').innerText = `Image uploaded successfully! URL: ${uploadedImageUrl}`;

        // Step 4: Send image URL and access token to backend for processing
        await processImage(uploadedImageUrl, accessToken);
      } else {
        document.getElementById('result').innerText = "Error uploading image to imgbb.";
      }
    } catch (error) {
      console.error("Error uploading image:", error);
      document.getElementById('result').innerText = "Error occurred during upload.";
    }
  }

  async function processImage(imageUrl, accessToken) {
    try {
      const response = await fetch('/.netlify/functions/process-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageUrl, accessToken })
      });

      const result = await response.json();
      document.getElementById('result').innerText += `\nProcessing result: ${JSON.stringify(result)}`;
    } catch (error) {
      console.error("Error processing image:", error);
      document.getElementById('result').innerText += "\nError occurred during image processing.";
    }
  }
</script>

