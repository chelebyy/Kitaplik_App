# Kitaplik App Project Overview

## Purpose

A mobile application for managing personal book collections, tracking reading habits, and getting book recommendations. It is designed to be **offline-first**, storing all user data locally on the device.

## Core Features

- **Book Management**: Add, edit, and organize books by reading status (Want to read, Reading, Finished).
- **Barcode Scanner**: Quickly add books by scanning ISBN barcodes using the camera.
- **Intelligent Search**: Search for books using the Google Books API.
- **Recommendations**: "Magic Recommendation" system for personalized book suggestions.
- **Offline Auth**: Nickname-based local profile creation, no server required.
- **Backup & Restore**: File-based backup and restore via system sharing.
- **Multi-language**: Support for Turkish and English (UI only).

## Tech Stack

- **Framework**: Expo (React Native 0.81.5, SDK 54)
- **Language**: TypeScript
- **Navigation**: Expo Router (File-based)
- **Styling**: NativeWind (Tailwind CSS) via `clsx` and `tailwind-merge`
- **Icons**: Lucide React Native
- **Storage**: AsyncStorage (@react-native-async-storage/async-storage)
- **State Management**: React Context API
- **API**: Google Books API
- **Testing**: Jest + Testing Library
