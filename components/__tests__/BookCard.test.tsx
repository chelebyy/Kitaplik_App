import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import { BookCard } from "../BookCard";

// Mocks
jest.mock("@/context/ThemeContext", () => ({
  useTheme: () => ({
    colors: {
      text: "#000",
      textSecondary: "#666",
      border: "#ccc",
      card: "#fff",
      primary: "#007AFF",
    },
    isDarkMode: false,
  }),
}));

jest.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const msgs: Record<string, string> = {
        reading: "Okunuyor",
        read: "Okundu",
        to_read: "Okunacak",
        book_detail_hint: "Kitap detaylarına git",
        status_label: "Durum",
      };
      return msgs[key] || key;
    },
  }),
}));

const mockBook = {
  id: "1",
  title: "Test Kitabı",
  author: "Test Yazarı",
  status: "Okunuyor" as const,
  coverUrl: "https://example.com/cover.jpg",
  totalPage: 200,
  currentPage: 50,
  pageCount: 200,
  rating: 4,
  progress: 0.25,
  addedAt: new Date().getTime(),
  updatedAt: new Date().getTime(),
};

describe("BookCard (UI Tests)", () => {
  it("matches snapshot", () => {
    const { toJSON } = render(<BookCard book={mockBook} />);
    expect(toJSON()).toMatchSnapshot();
  });

  it("renders book title and author correctly", () => {
    const { getByText } = render(<BookCard book={mockBook} />);
    expect(getByText("Test Kitabı")).toBeTruthy();
    expect(getByText("Test Yazarı")).toBeTruthy();
  });

  it("calls onPress when pressed", () => {
    const onPressMock = jest.fn();
    const { getByRole } = render(
      <BookCard book={mockBook} onPress={onPressMock} />,
    );

    fireEvent.press(getByRole("button"));
    expect(onPressMock).toHaveBeenCalled();
  });

  it("calls onPressId with book id when pressed", () => {
    const onPressIdMock = jest.fn();
    const { getByRole } = render(
      <BookCard book={mockBook} onPressId={onPressIdMock} />,
    );

    fireEvent.press(getByRole("button"));
    expect(onPressIdMock).toHaveBeenCalledWith("1");
  });

  it("shows correct status label for Reading", () => {
    const { getByText } = render(<BookCard book={mockBook} />);
    expect(getByText("Okunuyor")).toBeTruthy();
  });
});
