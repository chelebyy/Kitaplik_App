import React from "react";
import { render, fireEvent, screen } from "@testing-library/react-native";
import { Text, LayoutAnimation } from "react-native";
import { CollapsibleSection } from "../CollapsibleSection";

// Mock dependencies
jest.mock("../../context/ThemeContext", () => ({
  useTheme: () => ({
    colors: {
      sectionHeader: "#333",
      iconBackground: "#f0f0f0",
      card: "#fff",
    },
  }),
}));

jest.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        expanded: "açık",
        collapsed: "kapalı",
        toggle_section: "Açmak veya kapatmak için dokunun",
      };
      return translations[key] || key;
    },
  }),
}));

jest.mock("lucide-react-native", () => ({
  ChevronDown: () => null,
}));

// Mock LayoutAnimation logic inside tests or expect it to be handled by RN mock
// But we can ensure it doesn't crash:
const mockConfigureNext = jest.fn();
jest
  .spyOn(LayoutAnimation, "configureNext")
  .mockImplementation(mockConfigureNext);

describe("CollapsibleSection", () => {
  const defaultProps = {
    title: "Test Bölümü",
    children: <Text>Test İçerik</Text>,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Render Tests", () => {
    it("renders title correctly", () => {
      render(<CollapsibleSection {...defaultProps} />);
      expect(screen.getByText("Test Bölümü")).toBeTruthy();
    });

    it("renders with icon when provided", () => {
      const MockIcon = () => <Text>Icon</Text>;
      render(<CollapsibleSection {...defaultProps} icon={<MockIcon />} />);
      expect(screen.getByText("Icon")).toBeTruthy();
    });

    it("does not show content when defaultOpen is false", () => {
      render(<CollapsibleSection {...defaultProps} defaultOpen={false} />);
      expect(screen.queryByText("Test İçerik")).toBeNull();
    });

    it("shows content when defaultOpen is true", () => {
      render(<CollapsibleSection {...defaultProps} defaultOpen={true} />);
      expect(screen.getByText("Test İçerik")).toBeTruthy();
    });
  });

  describe("Interaction Tests", () => {
    it("expands content when header is pressed", () => {
      render(<CollapsibleSection {...defaultProps} defaultOpen={false} />);

      // İçerik başlangıçta görünmemeli
      expect(screen.queryByText("Test İçerik")).toBeNull();

      // Header'a tıkla
      const header = screen.getByRole("button");
      fireEvent.press(header);

      // İçerik görünmeli
      expect(screen.getByText("Test İçerik")).toBeTruthy();
    });

    it("collapses content when header is pressed again", () => {
      render(<CollapsibleSection {...defaultProps} defaultOpen={true} />);

      // İçerik başlangıçta görünmeli
      expect(screen.getByText("Test İçerik")).toBeTruthy();

      // Header'a tıkla
      const header = screen.getByRole("button");
      fireEvent.press(header);

      // İçerik artık görünmemeli
      expect(screen.queryByText("Test İçerik")).toBeNull();
    });
  });

  describe("Accessibility Tests", () => {
    it("has correct accessibility role", () => {
      render(<CollapsibleSection {...defaultProps} />);
      expect(screen.getByRole("button")).toBeTruthy();
    });

    it("has correct accessibility label when collapsed", () => {
      render(<CollapsibleSection {...defaultProps} defaultOpen={false} />);
      const header = screen.getByRole("button");
      expect(header.props.accessibilityLabel).toContain("kapalı");
    });

    it("has correct accessibility label when expanded", () => {
      render(<CollapsibleSection {...defaultProps} defaultOpen={true} />);
      const header = screen.getByRole("button");
      expect(header.props.accessibilityLabel).toContain("açık");
    });

    it("has accessibilityState.expanded set correctly", () => {
      render(<CollapsibleSection {...defaultProps} defaultOpen={true} />);
      const header = screen.getByRole("button");
      expect(header.props.accessibilityState.expanded).toBe(true);
    });
  });
});
