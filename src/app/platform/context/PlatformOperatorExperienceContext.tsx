import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  DEFAULT_OPERATOR_ACCESSIBILITY,
  DEFAULT_OPERATOR_DEFAULT_VIEWS,
  DEFAULT_OPERATOR_DISPLAY,
  DEFAULT_OPERATOR_LOCALIZATION,
  DEFAULT_OPERATOR_NOTIFICATION_CHANNELS,
  DEFAULT_UNREAD_NOTIFICATION_IDS,
  INITIAL_PLATFORM_NOTIFICATIONS,
  platformOperatorActiveSessions,
  type OperatorAccessibilityPreferences,
  type OperatorDefaultViewPreferences,
  type OperatorDisplayPreferences,
  type OperatorLocalizationPreferences,
  type OperatorNotificationChannelPreferences,
  type PlatformNotificationItem,
} from "../data/platformOperatorProfile";

const READ_IDS_KEY = "verifyme_platform_notification_read_ids";
const PREFS_KEY = "verifyme_platform_operator_prefs";

export type OperatorExperiencePreferences = {
  display: OperatorDisplayPreferences;
  localization: OperatorLocalizationPreferences;
  defaultViews: OperatorDefaultViewPreferences;
  accessibility: OperatorAccessibilityPreferences;
  notificationChannels: OperatorNotificationChannelPreferences;
};

const DEFAULT_PREFS: OperatorExperiencePreferences = {
  display: { ...DEFAULT_OPERATOR_DISPLAY },
  localization: { ...DEFAULT_OPERATOR_LOCALIZATION },
  defaultViews: { ...DEFAULT_OPERATOR_DEFAULT_VIEWS },
  accessibility: { ...DEFAULT_OPERATOR_ACCESSIBILITY },
  notificationChannels: { ...DEFAULT_OPERATOR_NOTIFICATION_CHANNELS },
};

function loadJson<T>(key: string): T | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(key);
    if (raw == null) return null;
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

function saveJson(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* ignore */
  }
}

function initialReadIdSet(): Set<string> {
  const stored = loadJson<string[]>(READ_IDS_KEY);
  if (stored && Array.isArray(stored)) {
    return new Set(stored);
  }
  const all = new Set(INITIAL_PLATFORM_NOTIFICATIONS.map((n) => n.id));
  for (const id of DEFAULT_UNREAD_NOTIFICATION_IDS) {
    all.delete(id);
  }
  const arr = [...all];
  saveJson(READ_IDS_KEY, arr);
  return all;
}

function initialPreferences(): OperatorExperiencePreferences {
  const stored = loadJson<Partial<OperatorExperiencePreferences>>(PREFS_KEY);
  if (!stored) return structuredClone(DEFAULT_PREFS);
  return {
    display: { ...DEFAULT_PREFS.display, ...stored.display },
    localization: { ...DEFAULT_PREFS.localization, ...stored.localization },
    defaultViews: { ...DEFAULT_PREFS.defaultViews, ...stored.defaultViews },
    accessibility: { ...DEFAULT_PREFS.accessibility, ...stored.accessibility },
    notificationChannels: {
      ...DEFAULT_PREFS.notificationChannels,
      ...stored.notificationChannels,
    },
  };
}

type PlatformOperatorExperienceContextValue = {
  notifications: Array<PlatformNotificationItem & { read: boolean }>;
  unreadCount: number;
  preferences: OperatorExperiencePreferences;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  setNotificationChannels: (partial: Partial<OperatorNotificationChannelPreferences>) => void;
  updatePreferences: (next: OperatorExperiencePreferences) => void;
  resetPreferencesToDefaults: () => void;
  preferencesFeedback: string | null;
  setPreferencesFeedback: (msg: string | null) => void;
  securityActionFeedback: string | null;
  setSecurityActionFeedback: (msg: string | null) => void;
  revokedSessionIds: Set<string>;
  revokeSession: (sessionId: string) => void;
  signOutAllOtherSessions: () => void;
};

const PlatformOperatorExperienceContext = createContext<PlatformOperatorExperienceContextValue | null>(null);

export function PlatformOperatorExperienceProvider({ children }: { children: ReactNode }) {
  const [readIds, setReadIds] = useState<Set<string>>(() => initialReadIdSet());
  const [preferences, setPreferencesState] = useState<OperatorExperiencePreferences>(() => initialPreferences());
  const [preferencesFeedback, setPreferencesFeedback] = useState<string | null>(null);
  const [securityActionFeedback, setSecurityActionFeedback] = useState<string | null>(null);
  const [revokedSessionIds, setRevokedSessionIds] = useState<Set<string>>(new Set());

  const persistReads = useCallback((next: Set<string>) => {
    setReadIds(next);
    saveJson(READ_IDS_KEY, [...next]);
  }, []);

  const markNotificationRead = useCallback(
    (id: string) => {
      persistReads(new Set([...readIds, id]));
    },
    [readIds, persistReads],
  );

  const markAllNotificationsRead = useCallback(() => {
    persistReads(new Set(INITIAL_PLATFORM_NOTIFICATIONS.map((n) => n.id)));
  }, [persistReads]);

  const notifications = useMemo(
    () =>
      INITIAL_PLATFORM_NOTIFICATIONS.map((n) => ({
        ...n,
        read: readIds.has(n.id),
      })).sort((a, b) => Date.parse(b.timestamp) - Date.parse(a.timestamp)),
    [readIds],
  );

  const unreadCount = useMemo(() => notifications.filter((n) => !n.read).length, [notifications]);

  const persistPreferences = useCallback((next: OperatorExperiencePreferences) => {
    setPreferencesState(next);
    saveJson(PREFS_KEY, next);
  }, []);

  const updatePreferences = useCallback(
    (next: OperatorExperiencePreferences) => {
      persistPreferences(next);
      setPreferencesFeedback("Preferences saved on this device. Production requires backend sync and audit.");
      window.setTimeout(() => setPreferencesFeedback(null), 5000);
    },
    [persistPreferences],
  );

  const setNotificationChannels = useCallback(
    (partial: Partial<OperatorNotificationChannelPreferences>) => {
      const next: OperatorExperiencePreferences = {
        ...preferences,
        notificationChannels: { ...preferences.notificationChannels, ...partial },
      };
      persistPreferences(next);
    },
    [preferences, persistPreferences],
  );

  const resetPreferencesToDefaults = useCallback(() => {
    const fresh: OperatorExperiencePreferences = JSON.parse(JSON.stringify(DEFAULT_PREFS)) as OperatorExperiencePreferences;
    persistPreferences(fresh);
    setPreferencesFeedback("Restored defaults on this device.");
    window.setTimeout(() => setPreferencesFeedback(null), 5000);
  }, [persistPreferences]);

  const revokeSession = useCallback((sessionId: string) => {
    setRevokedSessionIds((prev) => new Set([...prev, sessionId]));
    setSecurityActionFeedback("Session marked revoked in this preview. Production must call identity services and write audit events.");
    window.setTimeout(() => setSecurityActionFeedback(null), 6000);
  }, []);

  const signOutAllOtherSessions = useCallback(() => {
    setRevokedSessionIds((prev) => {
      const next = new Set(prev);
      for (const row of platformOperatorActiveSessions) {
        if (!row.isCurrent) next.add(row.id);
      }
      return next;
    });
    setSecurityActionFeedback("Other sessions cleared in this preview only. Requires backend authentication and audit in production.");
    window.setTimeout(() => setSecurityActionFeedback(null), 6000);
  }, []);

  const value = useMemo(
    (): PlatformOperatorExperienceContextValue => ({
      notifications,
      unreadCount,
      preferences,
      markNotificationRead,
      markAllNotificationsRead,
      setNotificationChannels,
      updatePreferences,
      resetPreferencesToDefaults,
      preferencesFeedback,
      setPreferencesFeedback,
      securityActionFeedback,
      setSecurityActionFeedback,
      revokedSessionIds,
      revokeSession,
      signOutAllOtherSessions,
    }),
    [
      notifications,
      unreadCount,
      preferences,
      markNotificationRead,
      markAllNotificationsRead,
      setNotificationChannels,
      updatePreferences,
      resetPreferencesToDefaults,
      preferencesFeedback,
      securityActionFeedback,
      revokedSessionIds,
      revokeSession,
      signOutAllOtherSessions,
    ],
  );

  return (
    <PlatformOperatorExperienceContext.Provider value={value}>{children}</PlatformOperatorExperienceContext.Provider>
  );
}

export function usePlatformOperatorExperience(): PlatformOperatorExperienceContextValue {
  const ctx = useContext(PlatformOperatorExperienceContext);
  if (!ctx) {
    throw new Error("usePlatformOperatorExperience must be used within PlatformOperatorExperienceProvider");
  }
  return ctx;
}
