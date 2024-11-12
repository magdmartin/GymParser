---
layout: default
title: Test
---

<h2>Test Page</h2>
<p>Strava Client ID: <span id="clientId">Loading...</span></p>

<script>
  async function fetchClientId() {
    try {
      const response = await fetch('/.netlify/functions/get-client-id');
      const data = await response.json();
      document.getElementById('clientId').textContent = data.clientId;
    } catch (error) {
      console.error("Error fetching client ID:", error);
      document.getElementById('clientId').textContent = "Error loading client ID";
    }
  }

  // Fetch the client ID when the page loads
  fetchClientId();
</script>

