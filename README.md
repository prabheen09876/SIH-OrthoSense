# SIH-OrthoSense

A responsive React prototype for AI-assisted early osteoarthritis risk screening across North Eastern India. It turns the supplied SIH concepts into a coherent clinician workflow with an interactive 3D risk lens.

## Included workflow

- Regional clinician dashboard
- Patient and terrain-context intake
- Bilateral IMU and pressure-insole synchronization
- Live 3D movement capture with telemetry
- Multimodal OA risk report and clinical safeguard
- Offline field-mode and NER screening-network cues

## Run locally

```bash
npm install
npm run dev
```

Open `http://localhost:5173`.

## Checks

```bash
npm run lint
npm run build
```

## Stack

React, TypeScript, Vite, React Router, Motion, Lucide, Three.js, React Three Fiber, and Drei.

The clinical values are demonstration data. OrthoSense AI is presented as a screening aid, not a diagnostic device.
