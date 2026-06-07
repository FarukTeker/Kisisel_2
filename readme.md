# Kisisel

Kisisel is a personalized newspaper prototype built for CENG318. The repository currently contains:

- a web frontend in `frontend/`
- a Node.js API in `apps/api/`
- an iOS prototype in `ios/Kisisel/`
- project documentation in `docs/`

## Requirements

- Node.js 20+
- npm 10+
- Xcode 15+ for the iOS app
- Xcode command line tools

## Clone

```bash
git clone https://github.com/FarukTeker/Kisisel_2.git
cd Kisisel_2
```

## Web App Setup

Install dependencies:

```bash
cd frontend
npm install
```

Start the frontend:

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

## API Setup

Install dependencies:

```bash
cd apps/api
npm install
```

Start the API:

```bash
npm run dev
```

Health check:

```text
http://localhost:4000/health
```

## Run Web + API Together

Open two terminal tabs.

Terminal 1:

```bash
cd apps/api
npm install
npm run dev
```

Terminal 2:

```bash
cd frontend
npm install
npm run dev
```

## iOS App Setup

The iOS app is located in `ios/Kisisel/`.

Open it in Xcode:

```bash
open ios/Kisisel/Kisisel.xcodeproj
```

Then:

1. Select the `Kisisel` scheme.
2. Choose an iPhone simulator.
3. Press Run.

The app uses local seeded prototype data, so no separate backend setup is required just to browse the iOS prototype.

## Troubleshooting

### Port already in use

If `3000` or `4000` is already occupied, stop the old process or change the port before starting the app.

### iOS password autofill overlay

If the Simulator shows the strong-password overlay on auth fields, close and reopen the app after the latest pull. The auth inputs are configured for login/register flows in the current version.

### Xcode derived data / simulator state

If the iOS app behaves strangely after updates, clean the build folder in Xcode and relaunch the simulator.

## Project Structure

```text
ceng318-project/
├── apps/
│   └── api/          # Express API
├── frontend/         # Next.js frontend
├── ios/
│   └── Kisisel/      # SwiftUI iOS prototype
└── docs/             # Course and design documents
```

## Documentation

Some earlier course documentation and proposal files are still kept under `docs/`.
