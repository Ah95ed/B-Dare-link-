# wonder_link_game

A new Flutter project.

## Getting Started

This project is a starting point for a Flutter application.

A few resources to get you started if this is your first Flutter project:

- [Lab: Write your first Flutter app](https://docs.flutter.dev/get-started/codelab)
- [Cookbook: Useful Flutter samples](https://docs.flutter.dev/cookbook)

For help getting started with Flutter development, view the
[online documentation](https://docs.flutter.dev/), which offers tutorials,
samples, guidance on mobile development, and a full API reference.

## Local Testing Before Cloudflare Deploy

1. Start backend locally:

```powershell
cd backend
npm install
npm run db:init:local
npm run dev:local
```

2. Run Flutter app against local backend:

```powershell
# Android Emulator
flutter run --dart-define=API_BASE_URL=http://10.0.2.2:8787

# iOS Simulator / Web / Desktop
flutter run --dart-define=API_BASE_URL=http://127.0.0.1:8787
```

3. Run Flutter app against production backend:

```powershell
flutter run --dart-define=API_BASE_URL=https://wonder-link-backend.amhmeed31.workers.dev
```

Notes:
- `API_BASE_URL` is now used across auth, game, admin, tournament, and competition services.
- If no `API_BASE_URL` is provided, the app defaults to production.
