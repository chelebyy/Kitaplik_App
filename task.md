# Task: Test Infrastructure Repair

## Goal

Fix the testing infrastructure to allow running unit tests without crashes due to unmocked native modules, specifically `react-native-google-mobile-ads`.

## Checklist

- [ ] **Phase 1: Configuration Updates**
  - [ ] Update `jest.setup.js` with required mocks.
  - [ ] Update `package.json` `transformIgnorePatterns`.

- [ ] **Phase 2: Verification**
  - [ ] Clear Jest cache (`npm test -- --clearCache`).
  - [ ] Run `npm test CollapsibleSection` to verify specific fix.
  - [ ] Run all tests to ensure project stability.
