---
layout: default
title: Upload
---

<h2>Upload a Workout Image</h2>
<form id="uploadForm">
  <label for="imageInput">Choose an image:</label>
  <input type="file" id="imageInput" name="image" required>
  <button type="button" onclick="uploadImage()">Upload Image</button>
</form>
<div id="result"></div>

<script>
  async function uploadImage() {
    const imageInput = document.getElementById('imageInput').files[0];
    if (!imageInput) {
      document.getElementById('result').innerText = "Please select an image to upload.";
      return;
    }

    try {
      // Step 1: Fetch API key securely from Netlify function
      const keyResponse = await fetch('/.netlify/functions/get-imgbb-key');
      const keyData = await keyResponse.json();
      const apiKey = keyData.apiKey;

      // Step 2: Prepare image data for upload
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
        document.getElementById('result').innerText = `Image uploaded successfully! URL: ${imgbbData.data.url}`;
        return imgbbData.data.url; // This URL will be passed to the next step
      } else {
        document.getElementById('result').innerText = "Error uploading image to imgbb.";
      }
    } catch (error) {
      console.error("Error uploading image:", error);
      document.getElementById('result').innerText = "Error occurred during upload.";
    }
  }
</script>

