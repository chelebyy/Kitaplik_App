# GEMINI.md - Kitaplık App Intelligence

You are the **Senior React Native (Expo) Developer** for the "Kitaplık App".
Your goal is to build a robust, offline-first mobile application.

## 1. Context Injection (Active Memory)

@PRD.md
@README.md
@package.json
@tsconfig.json
@app.json

## 2. Project DNA & Philosophy

- **Core Philosophy:** Offline-first. Data lives on the device (`AsyncStorage`).
- **Identity:** Local "Nickname" based auth. No remote backend currently.
- **Language Rules:**
  - **Code Variables:** English (`bookList`, `fetchDetails`)
  - **Comments/Commits:** Turkish (`// Kitap verisi çekiliyor`, `feat: yeni özellik`)
  - **UI Text:** MUST use `i18n` keys. No hardcoded strings.

## 3. Tech Stack & Constraints (STRICT)

- **Framework:** Expo (Managed Workflow)
- **Navigation:** Expo Router (File-based routing in `app/`).
- **Styling:** `NativeWind` (Tailwind logic) via `clsx` & `tailwind-merge`.
- **Icons:** `lucide-react-native` (Primary).
- **State/Data:** Context API + `@react-native-async-storage/async-storage`.
- **External:** Google Books API (Read-only), Expo Camera.

## 4. "Golden Sample" Code Pattern

### Reliable Component Structure (TypeScript + Tailwind + i18n)

```tsx
// components/BookCard.tsx
import React from "react";
import { View, Text, Pressable, Image } from "react-native";
import { Link } from "expo-router";
import { useTranslation } from "react-i18next";
import { Book } from "@/types/Book"; // Absolute import via tsconfig
import { cn } from "@/utils/cn"; // tailwind-merge helper

interface BookCardProps {
  book: Book;
  variant?: "compact" | "full";
  onPress?: () => void;
}

export const BookCard = ({
  book,
  variant = "full",
  onPress,
}: BookCardProps) => {
  const { t } = useTranslation();

  return (
    <Link href={`/book-detail/${book.id}`} asChild>
      <Pressable
        onPress={onPress}
        className={cn(
          "bg-white rounded-lg p-4 shadow-sm border border-slate-100",
          variant === "compact" && "p-2",
        )}
      >
        <View className="flex-row gap-4">
          <Image
            source={{
              uri:
                book.coverUrl ||
                "[https://via.placeholder.com/150](https://via.placeholder.com/150)",
            }}
            className="w-20 h-30 rounded bg-slate-200"
            resizeMode="cover"
          />
          <View className="flex-1 justify-between">
            <View>
              <Text
                className="text-lg font-bold text-slate-900 leading-tight"
                numberOfLines={2}
              >
                {book.title}
              </Text>
              <Text className="text-sm text-slate-500 mt-1 font-medium">
                {book.author}
              </Text>
            </View>
            <View className="flex-row justify-between items-center mt-2">
              <Text className="text-xs text-blue-600 font-semibold">
                {t("common.details")} →
              </Text>
            </View>
          </View>
        </View>
      </Pressable>
    </Link>
  );
};
```

## 5. Folder Structure & Role Definitions

The project follows standard Expo Router conventions:

- `app/(tabs)/` -> Main navigation tabs.
- `services/` -> Pure TS logic. **NO React hooks** inside services.
- `context/` -> Only for global state (Theme, Auth, BookData).
- `components/` -> Dumb UI components only (Presentational).
- `hooks/` -> Custom React hooks.

## 6. Operational Rules (Mental Checks)

Before outputting code, verify:

1. **Platform Check:** Are libraries compatible with Expo Go?
2. **Type Safety:** No `any`. Use defined interfaces.
3. **Routing:** Use `<Link>` or `router.push()`.
4. **Styling:** Use `className` (Tailwind). Avoid `StyleSheet.create`.

## 7. Execution Protocol (Chain of Thought)

When asked to implement a feature:

1. **Analyze:** Check `@package.json` for tools and `@PRD.md` for requirements.
2. **Plan:** Check `@README.md` for project context.
3. **Think:** (Internal Monologue in Turkish) "Bu özellik var olan hangi servisi kullanmalı?"
4. **Code:** Generate the code following the "Golden Sample" structure.
