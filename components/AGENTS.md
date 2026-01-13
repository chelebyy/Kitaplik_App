# Components Knowledge Base

## OVERVIEW

Reusable UI components for modals, cards, and interactions.

## STRUCTURE

```
components/
├── BookCard.tsx              # Book display card (301 lines)
├── BarcodeScannerModal.tsx   # Camera barcode scanner
├── RecommendationModal.tsx   # AI recommendations (571 lines - large)
├── PriceComparisonModal.tsx  # Price comparison for stores
├── ProfileModal.tsx          # User profile editing
├── BookNotes.tsx             # Book notes editing
├── CollapsibleSection.tsx    # Expandable UI section (memoized)
├── AnimatedSplash.tsx        # Splash animation
└── FilterDropdown.tsx        # Search/filter dropdown
```

## WHERE TO LOOK

| Task                 | Location                   | Notes                              |
| -------------------- | -------------------------- | ---------------------------------- |
| **Book display**     | `BookCard.tsx`             | Cover, status, progress indicator  |
| **Barcode scanning** | `BarcodeScannerModal.tsx`  | expo-camera integration            |
| **Recommendations**  | `RecommendationModal.tsx`  | AI-powered book suggestions        |
| **Price comparison** | `PriceComparisonModal.tsx` | Store links and pricing            |
| **Modals**           | `*Modal.tsx` files         | All use modal presentation pattern |
| **UI utilities**     | `CollapsibleSection.tsx`   | React.memo optimized               |

## CONVENTIONS

- **Modal pattern:** Components accept isOpen, onClose props
- **Icons:** Lucide React Native (Home, Book, Settings, etc.)
- **Styling:** NativeWind (Tailwind) + LinearGradient for gradients
- **Theme integration:** useTheme() for dynamic colors
- **Memoization:** CollapsibleSection uses React.memo
- **Context hooks:** Components consume contexts (useBooks, useAuth, etc.)
- **Test structure:** **tests** folder with .test.tsx files

## ANTI-PATTERNS

- **Large components:** RecommendationModal.tsx (571 lines) - extract logic
- **Missing prop types:** Always define explicit TypeScript interfaces
- **Over-memoization:** Only memoize when re-renders are observed
