# Board Gamer App

Project repo for bachelor's course "Project Mobile Software Engineering"

## Runbook

- **Web**: `npm install && npm run dev`
- **iOS**: `npm install && npx cap open ios`
- **Android**: `npm install && npx cap open android`

## Build Guide

1. Run `ionic build` to generate the web assets.
2. Run `npx cap sync` to copy web assets and update native plugins.
3. Use `npx cap open ios` or `npx cap open android` to open the project in Xcode or Android Studio.
4. Build and run the app on a real device or emulator.