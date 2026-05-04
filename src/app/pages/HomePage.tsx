import { Link } from "react-router";
import { Shield, Building2, ArrowRight } from "lucide-react";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";

export function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center p-6">
      <div className="max-w-4xl w-full">
        <div className="text-center mb-12">
          <h1 className="text-[48px] font-bold text-foreground mb-4">
            VerifyMe Admin Portals
          </h1>
          <p className="text-[18px] text-muted-foreground">
            Choose your portal to get started
          </p>
        </div>

        <div className="grid grid-cols-2 gap-8">
          <Card className="p-8 shadow-lg hover:shadow-xl transition-shadow">
            <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center mb-6">
              <Shield className="w-9 h-9 text-primary-foreground" />
            </div>
            <h2 className="text-[24px] font-semibold text-foreground mb-3">
              Platform Admin Portal
            </h2>
            <p className="text-[15px] text-muted-foreground mb-6 leading-relaxed">
              Manage all Organizations, monitor system health, and configure platform-wide settings.
              Full operational control for internal administrators.
            </p>
            <Link to="/platform">
              <Button className="w-full group">
                Access Platform Admin
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <div className="mt-4 pt-4 border-t border-border">
              <p className="text-[13px] text-muted-foreground">
                <strong>Features:</strong> Organization management, system monitoring, analytics
              </p>
            </div>
          </Card>

          <Card className="p-8 shadow-lg hover:shadow-xl transition-shadow">
            <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center mb-6">
              <Building2 className="w-9 h-9 text-primary-foreground" />
            </div>
            <h2 className="text-[24px] font-semibold text-foreground mb-3">
              Enterprise Admin Portal
            </h2>
            <p className="text-[15px] text-muted-foreground mb-6 leading-relaxed">
              Manage your Organization’s team, projects, and settings.
              Simple and intuitive interface for customer administrators.
            </p>
            <Link to="/enterprise">
              <Button className="w-full group">
                Access Organization Portal
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <div className="mt-4 pt-4 border-t border-border">
              <p className="text-[13px] text-muted-foreground">
                <strong>Features:</strong> Team management, billing, activity tracking
              </p>
            </div>
          </Card>
        </div>

        <div className="mt-12 text-center">
          <p className="text-[14px] text-muted-foreground">
            Built with a shared design system for consistent user experience
          </p>
        </div>
      </div>
    </div>
  );
}
