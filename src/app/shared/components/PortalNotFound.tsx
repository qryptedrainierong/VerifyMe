type PortalNotFoundScope = "platform" | "organization";

const copy: Record<PortalNotFoundScope, string> = {
  platform: "The page you're looking for doesn't exist in the platform admin portal.",
  organization: "The page you're looking for doesn't exist in the organization portal.",
};

export function PortalNotFound({ scope }: { scope: PortalNotFoundScope }) {
  return (
    <div className="flex min-h-0 flex-1 flex-col bg-background">
      <div className="mx-auto flex w-full max-w-screen-2xl flex-1 flex-col items-center justify-center px-6 py-16 text-center sm:px-8 sm:py-24">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Page not found</h1>
        <p className="mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">{copy[scope]}</p>
      </div>
    </div>
  );
}
