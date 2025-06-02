# Board Gamer App

Project repo for bachelor's course "Project Mobile Software Engineering".

A mobile app for organizing board game events for groups of players, including game voting, host rotations, group chats, push notifications and more.

Built with Ionic + Capacitor and TypeScript React for Frontend, Firebase with Authentication, Firestore, Functions and Messaging/FCM for Backend.

## Runbook

- **iOS**: `npm install && npx cap open ios` -> Run on simulator or physical device
- **Android**: `npm install && npx cap open android` -> Run on emulator or physical device

### Firebase Setup

- `Authentication`, `Firestore` and `Messaging` need to be enabled in the Firebase Web Console (functions requires the Blaze pay-as-you-go plan to be activated, this is required for FCM push notifications to be triggered)
- **iOS**: `GoogleService-Info.plist` needs to be downloaded from the Firebase Web Console and placed under `ios/App/App` in Xcode
- **Android**: `google-service.json` needs to be downloaded from the Firebase Web Console and placed under `android/app`
- Firebase credentials need to be extracted from the Firebase Web Console and placed into the `.env` (see `.env.example`)
- functions, rules and indexes have to be deployed to Firebase using `firebase deploy` (after any change respectively)

## Build Guide

1. Run `ionic build` to generate the web assets.
2. Run `npx cap sync` to copy web assets and update native plugins.
3. Use `npx cap open ios` or `npx cap open android` to open the project in Xcode or Android Studio.
4. Build and run the app on a real device or emulator.