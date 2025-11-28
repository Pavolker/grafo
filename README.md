<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This repository contains everything you need to run and deploy MDH GRAFOS locally or on Netlify.

View your app in AI Studio: https://ai.studio/apps/temp/1

## Run Locally

**Prerequisites:** Node.js

1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key.
3. Run the app:
   `npm run dev`

## Deploy on Netlify

1. Connect the `mdh-grafos` repository to Netlify (via drag & drop or Git provider).
2. Ensure Netlify uses `npm run build` as the build command and `dist` as the publish directory (configured in `netlify.toml`).
3. Define `VITE_GEMINI_API_KEY` in the Netlify environment variables with your Gemini API key.
4. Trigger a deploy (new push or manual deploy) to build and publish the static site.

> The supplied `netlify.toml` centralizes the build configuration so Netlify automatically picks the correct settings.

Need more guidance? See Netlify docs: https://docs.netlify.com/configure-builds/get-started/.
