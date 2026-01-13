/**
 * Notification Constants
 * Magic numbers extracted for SonarQube compliance
 */

// Notification intervals (in seconds/days)
export const SECONDS_PER_DAY = 24 * 60 * 60;
export const SECONDS_PER_WEEK = 7 * SECONDS_PER_DAY;
export const DEFAULT_INACTIVE_USER_DAYS = 3;
export const DEFAULT_MAGIC_RECOMMENDATION_DAYS = 15;

// Notification scheduling times (hour, minute)
export const DAILY_CREDIT_REMINDER_HOUR = 10;
export const DAILY_CREDIT_REMINDER_MINUTE = 0;
export const WEEKLY_SUMMARY_WEEKDAY = 7; // Sunday (1=Monday, 7=Sunday)
export const WEEKLY_SUMMARY_HOUR = 18;
export const WEEKLY_SUMMARY_MINUTE = 0;
export const YEAR_END_MONTH = 1; // January
export const YEAR_END_DAY = 1;
export const YEAR_END_HOUR = 10;
export const YEAR_END_MINUTE = 0;

// Reading progress milestones (percentage)
export const PROGRESS_MILESTONES = [25, 50, 75] as const;
export type ProgressMilestone = (typeof PROGRESS_MILESTONES)[number];

// Storage keys
export const NOTIFICATION_SETTINGS_KEY = "notification_settings_v1";
export const INITIAL_PERMISSION_ASKED_KEY = "notification_permission_asked_v2";
