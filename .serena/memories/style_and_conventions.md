# Style and Coding Conventions

## Language

- **Logic & Variable Names**: English (e.g., `bookList`, `fetchDetails`).
- **Comments & Commits**: Turkish (e.g., `// Kitap verisi çekiliyor`, `feat: yeni özellik`).
- **UI Strings**: MUST use `i18n` keys via `useTranslation`. No hardcoded strings in JSX.

## Architecture

- **Offline-First**: Always assume data is stored locally.
- **Dumb Components**: UI components in `components/` should focus on presentation.
- **Services**: Pure business logic and API calls reside in `services/`. No React hooks here.
- **Context API**: Used for global state like Auth, Theme, and Book data.

## Styling

- **Tooling**: Use `NativeWind` (Tailwind CSS) utility classes.
- **Helper**: Use the `cn` utility (from `@/utils/cn`) which combines `clsx` and `tailwind-merge` for conditional classes.
- **Avoid**: Inline `StyleSheet.create` where possible, prefer Tailwind classes.

## TypeScript

- **Strict Mode**: Mandatory. No `any` types.
- **Interfaces**: Prefer interfaces for object shapes and component props.
- **Imports**: Use absolute paths (e.g., `@/components/...`) as configured in `tsconfig.json`.

## Icons

- Use `lucide-react-native` as the primary icon set.
