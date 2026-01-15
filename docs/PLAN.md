# Plan: BookSelectionModal Image Migration

## Problem

`BookSelectionModal.tsx` uses `react-native` Image instead of `expo-image`.

## API Differences Analysis

| Property | react-native Image | expo-image |
|----------|-------------------|------------|
| `resizeMode` | ✅ | ❌ → Use `contentFit` |
| `accessibilityIgnoresInvertColors` | ✅ | ❌ Not supported (remove) |
| `source={{ uri }}` | ✅ | ✅ Same |
| `className` | ✅ | ✅ Same |

## Proposed Changes

### [MODIFY] [BookSelectionModal.tsx](file:///c:/Users/muham/OneDrive/Belgeler/Kitaplik/Kitaplik_App/components/BookSelectionModal.tsx)

1. **Line 9**: Change import

   ```tsx
   // Before:
   import { Modal, View, Text, Pressable, Image } from "react-native";
   
   // After:
   import { Modal, View, Text, Pressable } from "react-native";
   import { Image } from "expo-image";
   ```

2. **Line 81-86**: Update Image props

   ```tsx
   // Before:
   <Image
     source={{ uri: coverUrl }}
     className="w-full h-full"
     resizeMode="cover"
     accessibilityIgnoresInvertColors
   />
   
   // After:
   <Image
     source={{ uri: coverUrl }}
     className="w-full h-full"
     contentFit="cover"
     cachePolicy="memory-disk"
   />
   ```

## Risk Assessment

- ✅ Low risk - simple API migration
- ✅ No functionality change, only performance improvement
- ⚠️ `accessibilityIgnoresInvertColors` removed (iOS-only, rarely needed)

## Verification Plan

### Manual Test

1. Open app on device/emulator
2. Use barcode scanner to find a book with multiple editions
3. Verify book covers display correctly in selection modal
4. Verify image loads properly and looks correct
