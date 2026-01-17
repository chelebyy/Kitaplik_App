import React from "react";
import { renderHook, act } from "@testing-library/react-native";
import { Alert } from "react-native";
import { BooksProvider, useBooks, BookStatus } from "../BooksContext";

// Mock StorageService
jest.mock("../../services/storage/StorageService", () => ({
  __esModule: true,
  default: {
    getItem: jest.fn(() => Promise.resolve(null)),
    setItem: jest.fn(() => Promise.resolve()),
    removeItem: jest.fn(() => Promise.resolve()),
  },
}));

// Mock i18n
jest.mock("../../i18n/i18n", () => ({
  t: (key: string) => key,
}));

// Mock Alert
jest.spyOn(Alert, "alert");

// Mock CrashlyticsService
jest.mock("../../services/CrashlyticsService", () => ({
  __esModule: true,
  default: {
    initialize: jest.fn(() => Promise.resolve()),
    setBookCount: jest.fn(() => Promise.resolve()),
    setLastOperation: jest.fn(() => Promise.resolve()),
    recordError: jest.fn(() => Promise.resolve()),
    log: jest.fn(() => Promise.resolve()),
  },
}));
