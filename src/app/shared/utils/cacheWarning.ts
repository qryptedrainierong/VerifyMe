/**
 * Displays a console warning about browser caching if needed
 * This helps developers understand when they need to hard refresh
 */
export function checkCacheVersion() {
  const CURRENT_VERSION = "2.0.1";
  const STORAGE_KEY = "verifyme_last_version";

  try {
    const lastVersion = localStorage.getItem(STORAGE_KEY);
    
    if (lastVersion && lastVersion !== CURRENT_VERSION) {
      console.warn(
        `%c[VerifyMe] Version Update Detected`,
        "color: #f59e0b; font-weight: bold; font-size: 14px;",
      );
      console.warn(
        `%cPrevious: ${lastVersion} → Current: ${CURRENT_VERSION}`,
        "color: #6b7280; font-size: 12px;",
      );
      console.warn(
        `%cIf you experience issues, try a hard refresh:`,
        "color: #6b7280; font-size: 12px;",
      );
      console.warn(
        `%c• Windows/Linux: Ctrl+Shift+R\n• Mac: Cmd+Shift+R`,
        "color: #3b82f6; font-size: 12px; font-family: monospace;",
      );
    }
    
    localStorage.setItem(STORAGE_KEY, CURRENT_VERSION);
  } catch (error) {
    // localStorage might be disabled, ignore
    console.debug("[VerifyMe] localStorage not available");
  }
}
