# MoodMorph.exe — Y2K Emotion Photobooth

MoodMorph is a Y2K-inspired emotion-reactive photobooth built with React, Vite, browser canvas, and face-api.js. It combines a retro computer UI with webcam expression prediction and downloadable photo compositions.

## Run locally

1. Install Node.js LTS.
2. Open this project folder in VS Code.
3. In the terminal, run:

```bash
npm install
npm run dev
```

4. Open the localhost URL Vite prints. Choose **Start Camera** and allow camera permission, or upload a photo.

## Build for deployment

```bash
npm run build
npm run preview
```

The production output is written to `dist/`. Vercel settings for this Vite project: framework **Vite**, build command `npm run build`, output directory `dist`, root directory `./`.

## Photobooth features

- Live webcam and image upload
- Automatic facial-expression predictions and manual filter override
- Happy, surprised, sad, angry, and neutral visual themes
- Stickers, editable caption, filter intensity, flash treatment, and scanline toggle
- Single image, Polaroid, 3-frame photobooth strip, and 4-frame contact-sheet exports
- Dedicated 3-shot strip capture button
- PNG download and recent photo gallery
- Evaluation lab for user-labelled webcam samples

## Machine-learning note

The current browser classifier uses the pretrained face-api.js expression model. The evaluation lab measures user-labelled predictions from that model; it is not evidence that a custom VGG16 or MobileNet model has been trained. For an academic submission, report that distinction clearly and include a separate reproducible training/evaluation pipeline if you later train custom models.

## Privacy

Camera access is requested only after the user selects Start Camera. Webcam frames are processed in the browser. Photos are generated locally and are not uploaded by this application.

## Troubleshooting

- If camera access fails, allow it in browser site settings and close other apps using the camera.
- Camera access requires localhost during development or HTTPS in deployment.
- If the model host is unavailable, the camera and manual filter controls should still work; automatic predictions may remain unavailable.
- If a capture fails, wait for the camera preview to be live, then click **Snap Photo** again.
