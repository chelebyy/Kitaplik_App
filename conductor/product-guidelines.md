# Product Guidelines

## 1. Prose & Voice

- **Tone:** The application should maintain a minimalist and professional tone. Instructions should be clear, concise, and functional, prioritizing utility over conversation.
- **Language:** Use standard English and Turkish (as per i18n support) with simple, globally understood terminology. Avoid jargon or slang.
- **Empty States:** Provide helpful, action-oriented text for empty screens (e.g., "No books found. Scan a barcode to start.").

## 2. Visual Identity

- **Theme:** Respect system preferences for Dark/Light mode, ensuring high contrast and readability in both environments.
- **Colors:** Use a neutral palette with subtle accent colors for primary actions, adhering to the project's Tailwind configuration.
- **Typography:** Prioritize legibility. Use system fonts or the configured font stack for a native feel.

## 3. Interaction Design

- **Speed:** Interactions should feel instantaneous. Avoid unnecessary animations that delay user tasks.
- **Feedback:** Provide immediate visual feedback for all user actions (e.g., button presses, successful scans).
- **Navigation:** Follow platform-standard navigation patterns (tabs, stacks) provided by Expo Router for intuitive movement.

## 4. Quality Standards

- **Offline-First:** All core features must function without internet access. Handle network errors gracefully during metadata fetching.
- **Accessibility:** Ensure all interactive elements are accessible, with appropriate touch targets and screen reader support.
- **Performance:** Maintain 60fps scrolling and fast load times, even with large book collections.
