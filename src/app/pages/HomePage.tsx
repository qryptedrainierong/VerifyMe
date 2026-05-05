import { Link } from "react-router";
import { Shield, Building2, ArrowRight } from "lucide-react";
import { Button } from "../shared/components/ui/button";
import { Card } from "../shared/components/ui/card";

export function HomePage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50 p-6">
      <div className="mx-auto w-full max-w-screen-2xl">
        <div className="mb-12 text-center">
          <h1 className="mb-4 text-4xl font-bold tracking-tight text-foreground md:text-5xl">
            VerifyMe Admin Portals
          </h1>
          <p className="text-lg text-muted-foreground">Choose your portal to get started</p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 md:gap-8">
          <Card className="p-6 shadow-lg transition-shadow hover:shadow-xl sm:p-8">
            <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary">
              <Shield className="h-9 w-9 text-primary-foreground" />
            </div>
            <h2 className="mb-3 text-2xl font-semibold tracking-tight text-foreground">Platform Admin Portal</h2>
            <p className="mb-6 text-sm leading-relaxed text-muted-foreground sm:text-base">
              Manage all Organizations, monitor system health, and configure platform-wide settings.
              Full operational control for internal administrators.
            </p>
            <Link to="/platform">
              <Button className="group w-full">
                Access Platform Admin
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
            <div className="mt-4 border-t border-border pt-4">
              <p className="text-xs text-muted-foreground sm:text-sm">
                <strong>Features:</strong> Organization management, system monitoring, analytics
              </p>
            </div>
          </Card>

          <Card className="p-6 shadow-lg transition-shadow hover:shadow-xl sm:p-8">
            <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary">
              <Building2 className="h-9 w-9 text-primary-foreground" />
            </div>
            <h2 className="mb-3 text-2xl font-semibold tracking-tight text-foreground">Enterprise Admin Portal</h2>
            <p className="mb-6 text-sm leading-relaxed text-muted-foreground sm:text-base">
              Manage your Organization’s team, projects, and settings.
              Simple and intuitive interface for customer administrators.
            </p>
            <Link to="/enterprise">
              <Button className="group w-full">
                Access Organization Portal
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
            <div className="mt-4 border-t border-border pt-4">
              <p className="text-xs text-muted-foreground sm:text-sm">
                <strong>Features:</strong> Team management, billing, activity tracking
              </p>
            </div>
          </Card>
        </div>

        <div className="mt-12 text-center">
          <p className="text-sm text-muted-foreground">
            Built with a shared design system for consistent user experience
          </p>
        </div>
      </div>
    </div>
  );
}
