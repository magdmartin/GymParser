---
layout: default
title: Upload
---

<h2>Upload a Workout Image</h2>
<form id="uploadForm">
  <label for="imageUrl">Image URL:</label>
  <input type="text" id="imageUrl" name="imageUrl" required>
  <button type="button" onclick="processImage()">Process Image</button>
</form>
<div id="result"></div>

<h3>Authorize with Strava</h3>
<button onclick="loginWithStrava()">Login with Strava</button>

<script>
  async function loginWithStrava() {
    // Fetch the client ID from the Netlify function
    const response = await fetch('/.netlify/functions/get-client-id');
    const data = await response.json();
    const clientId = data.clientId;
    const redirectUri = "https://warm-mandazi-6b7218.netlify.app/.netlify/functions/strava-auth";

    // Construct the Strava URL
    const stravaUrl = `https://www.strava.com/oauth/authorize?client_id=${clientId}&response_type=code&redirect_uri=${redirectUri}&scope=activity:write,read_all`;

    // Redirect to Strava authorization
    window.location.href = stravaUrl;
  }
</script>

