---
layout: default
title: Authorize with Strava
---

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

