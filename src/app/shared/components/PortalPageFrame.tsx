import type { ReactNode } from "react";
import { cn } from "./ui/utils";

export type PortalPageFrameVariant = "default" | "fill";

export type PortalPageFrameProps = {
  title: string;
  description?: ReactNode;
  /** Right-aligned actions (e.g. primary buttons) on larger viewports */
  headerActions?: ReactNode;
  /** Alerts, stats, filters, or other blocks below the title row */
  headerExtra?: ReactNode;
  children: ReactNode;
  /** default: scrollable body fills remaining viewport under header */
  variant?: PortalPageFrameVariant;
  className?: string;
  /** Applied to the outer shell (e.g. h-full) */
  rootClassName?: string;
  /** Extra classes on the page body (main content column) */
  bodyClassName?: string;
  /** Extra classes on the header strip (e.g. bg-card) */
  headerClassName?: string;
  /** Max width for header + body inner containers (default: max-w-screen-2xl) */
  contentMaxWidthClass?: string;
  /** Override default h1 sizing (e.g. dashboard density) */
  headingClassName?: string;
};

/**
 * Shared page shell for VerifyMe Admin and Organization portals:
 * consistent title scale, description, max width, and padding.
 */
export function PortalPageFrame({
  title,
  description,
  headerActions,
  headerExtra,
  children,
  variant = "default",
  className,
  rootClassName,
  bodyClassName,
  headerClassName,
  contentMaxWidthClass = "max-w-screen-2xl",
  headingClassName,
}: PortalPageFrameProps) {
  const fill = variant === "fill";

  return (
    <div className={cn("flex min-h-0 flex-1 flex-col bg-background", fill && "min-h-full", rootClassName, className)}>
      <header
        className={cn(
          "shrink-0 border-b border-border bg-background px-6 py-5 sm:px-8",
          headerClassName,
        )}
      >
        <div className={cn("mx-auto w-full space-y-3", contentMaxWidthClass)}>
          <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
            <div className="min-w-0 flex-1 space-y-1">
              <h1 className={cn("text-2xl font-semibold tracking-tight text-foreground", headingClassName)}>{title}</h1>
              {description != null && description !== "" ? (
                <div className="max-w-3xl text-sm leading-snug text-muted-foreground">{description}</div>
              ) : null}
            </div>
            {headerActions ? (
              <div className="flex shrink-0 flex-wrap items-center gap-2 md:justify-end">{headerActions}</div>
            ) : null}
          </div>
          {headerExtra ? <div>{headerExtra}</div> : null}
        </div>
      </header>
      <div
        className={cn(
          "mx-auto w-full px-6 py-5 sm:px-8 sm:py-6",
          contentMaxWidthClass,
          fill && "min-h-0 flex-1 overflow-y-auto overscroll-contain",
          bodyClassName,
        )}
      >
        {children}
      </div>
    </div>
  );
}
