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
<a href="https://www.strava.com/oauth/authorize?client_id={{ site.strava_client_id }}&response_type=code&redirect_uri={{ site.strava_redirect_uri }}&scope=activity:write,read_all">
  <button>Login with Strava</button>
</a>

<script>
  async function processImage() {
    const imageUrl = document.getElementById('imageUrl').value;
    const response = await fetch('/.netlify/functions/process-image', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ imageUrl })
    });
    const result = await response.json();
    document.getElementById('result').innerText = JSON.stringify(result, null, 2);
  }
</script>

