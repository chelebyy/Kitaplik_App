# E2E Tests - Maestro

This directory contains end-to-end tests for the Ayraç (Kitaplık) app using [Maestro](https://maestro.mobile.dev).

## Prerequisites

1. **Java 17 or higher**

   ```bash
   java -version
   ```

2. **Install Maestro**

   ```bash
   # macOS
   brew install maestro

   # Linux
   curl -Ls "https://get.maestro.mobile.dev" | bash

   # Windows
   # Download from: https://github.com/mobile-dev-inc/maestro/releases/latest/download/maestro.zip
   # Extract to: C:\Users\YourName\maestro
   # Add to PATH: C:\Users\YourName\maestro\bin
   ```

3. **Android Emulator or iOS Simulator** (physical device also works)

4. **Build the app**
   ```bash
   npm run android
   # or
   npm run ios
   ```

## Test Flows

| Flow                    | Description                                   | Priority |
| ----------------------- | --------------------------------------------- | -------- |
| `add-book-manual.yaml`  | Manual book entry form                        | High     |
| `add-book-search.yaml`  | Search and add from Google Books              | High     |
| `add-book-barcode.yaml` | Barcode scanning to add book                  | Medium   |
| `update-progress.yaml`  | Update reading progress                       | Medium   |
| `settings-flow.yaml`    | Settings navigation and theme/language toggle | Low      |

## Running Tests

### Run all tests

```bash
maestro test e2e/flows/
```

### Run specific test

```bash
maestro test e2e/flows/add-book-manual.yaml
```

### Run with verbose output

```bash
maestro test e2e/flows/ --verbose
```

### Run with specific device

```bash
maestro test e2e/flows/ --deviceId <device-id>
```

## Test Data Requirements

Some tests require existing data:

- **update-progress.yaml**: Needs at least 1 book in the library
- **add-book-barcode.yaml**: Requires camera permissions (simulator may need mock)

## CI/CD

Tests run automatically on:

- Push to `main` or `develop` branches
- Pull requests to `main` or `develop` branches
- Manual trigger via GitHub Actions

See: `.github/workflows/e2e.yml`

## Troubleshooting

### Maestro command not found

Add Maestro to your PATH:

```bash
# Linux/macOS
export PATH="$PATH:$HOME/.maestro/bin"

# Windows
setx PATH "%PATH%;C:\Users\YourName\maestro\bin"
```

### Device not found

Start the emulator/simulator and run:

```bash
adb devices  # Android
xcrun simctl list  # iOS
```

### Camera permissions

For barcode tests on simulator, you may need to:

1. Enable camera in simulator settings
2. Or mock the barcode in test environment

### Network issues

Some tests require internet connection (Google Books API search).
Ensure your device/emulator has network access.

## Adding New Tests

1. Create new `.yaml` file in `e2e/flows/`
2. Follow Maestro syntax: https://docs.maestro.dev
3. Test locally before committing
4. Update this README

## Resources

- [Maestro Documentation](https://docs.maestro.dev)
- [Maestro GitHub](https://github.com/mobile-dev-inc/maestro)
- [Expo Router](https://docs.expo.dev/router/)
