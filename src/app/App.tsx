import { useState, useEffect } from "react";
import { PlatformApp } from "./platform/PlatformApp";
import { EnterpriseApp } from "./enterprise/EnterpriseApp";
import logoImage from "../imports/image-0.png";
import { checkCacheVersion } from "./shared/utils/cacheWarning";

type Portal = "platform" | "enterprise" | null;

// VerifyMe Portal Selector v2.0 - Fixed Caching Issues
const BUILD_VERSION = "2.0.1";

export default function App() {
  const [selectedPortal, setSelectedPortal] = useState<Portal>(null);

  useEffect(() => {
    console.log(`[VerifyMe] Application loaded - Version ${BUILD_VERSION}`);
    console.log(`[VerifyMe] Timestamp: ${new Date().toISOString()}`);
    checkCacheVersion();
  }, []);

  if (selectedPortal === "platform") {
    return <PlatformApp key="platform" />;
  }

  if (selectedPortal === "enterprise") {
    return <EnterpriseApp key="enterprise" />;
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="w-full max-w-4xl">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-6">
            <img src={logoImage} alt="VerifyMe" className="h-20 w-auto" />
          </div>
          <p className="text-[15px] text-muted-foreground">
            Select a portal to continue
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Platform Admin Portal */}
          <button
            onClick={() => setSelectedPortal("platform")}
            className="group bg-card border border-border rounded-lg p-8 text-left hover:border-primary hover:shadow-sm transition-all"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-primary"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                  />
                </svg>
              </div>
              <svg
                className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </div>
            <h2 className="text-[20px] font-semibold text-foreground mb-2">
              Platform Admin Portal
            </h2>
            <p className="text-[14px] text-muted-foreground mb-4">
              Internal operations portal for managing organizations, users, usage, and billing
            </p>
            <div className="flex flex-wrap gap-2">
              <span className="inline-flex items-center px-2 py-1 rounded bg-accent/50 text-[12px] text-accent-foreground">
                Organizations
              </span>
              <span className="inline-flex items-center px-2 py-1 rounded bg-accent/50 text-[12px] text-accent-foreground">
                Users
              </span>
              <span className="inline-flex items-center px-2 py-1 rounded bg-accent/50 text-[12px] text-accent-foreground">
                Usage
              </span>
              <span className="inline-flex items-center px-2 py-1 rounded bg-accent/50 text-[12px] text-accent-foreground">
                Billing
              </span>
            </div>
          </button>

          {/* Enterprise Admin Portal */}
          <button
            onClick={() => setSelectedPortal("enterprise")}
            className="group bg-card border border-border rounded-lg p-8 text-left hover:border-primary hover:shadow-sm transition-all"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-primary"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
              </div>
              <svg
                className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </div>
            <h2 className="text-[20px] font-semibold text-foreground mb-2">
              Organization Portal
            </h2>
            <p className="text-[14px] text-muted-foreground mb-4">
              Customer-facing portal for managing your team, billing, and settings
            </p>
            <div className="flex flex-wrap gap-2">
              <span className="inline-flex items-center px-2 py-1 rounded bg-accent/50 text-[12px] text-accent-foreground">
                Team
              </span>
              <span className="inline-flex items-center px-2 py-1 rounded bg-accent/50 text-[12px] text-accent-foreground">
                Billing
              </span>
              <span className="inline-flex items-center px-2 py-1 rounded bg-accent/50 text-[12px] text-accent-foreground">
                Settings
              </span>
            </div>
          </button>
        </div>

        <div className="mt-8 text-center">
          <p className="text-[13px] text-muted-foreground">
            Both portals share a unified design system with different UX approaches
          </p>
          <p className="text-[11px] text-muted-foreground mt-2">
            v{BUILD_VERSION}
          </p>
        </div>
      </div>
    </div>
  );
}