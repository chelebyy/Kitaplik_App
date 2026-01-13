# Task Completion Checklist

Before considering a task finished, ensure the following steps are performed:

1.  **Code Analysis**:
    - [ ] Run `npm run lint` and fix any warnings or errors.
    - [ ] Ensure all new code follows the `style_and_conventions.md`.

2.  **Testing**:
    - [ ] Run `npm test` to ensure no regressions are introduced.
    - [ ] Write unit tests for new logic or components if significant.

3.  **UI/UX**:
    - [ ] Verify that all UI strings are internationalized using `i18n`.
    - [ ] Check for proper dark/light mode support.
    - [ ] Ensure accessibility (ARIA labels where applicable).

4.  **Data**:
    - [ ] Verify that new features maintain the offline-first philosophy.
    - [ ] Ensure local storage updates are handled safely.

5.  **Documentation**:
    - [ ] Update any relevant documentation (PRD, README, etc.) if architecture changes.
    - [ ] Use meaningful commit messages in Turkish.
