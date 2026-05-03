import { Component, ReactNode } from "react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { AlertCircle } from "lucide-react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error("Error caught by boundary:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-background flex items-center justify-center p-6">
          <Card className="max-w-lg w-full p-8 border border-border shadow-sm">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center">
                <AlertCircle className="w-8 h-8 text-red-600" />
              </div>
              <div>
                <h2 className="text-[24px] font-semibold text-foreground mb-2">
                  Something went wrong
                </h2>
                <p className="text-[15px] text-muted-foreground mb-4">
                  The application encountered an error. Please try refreshing the page.
                </p>
                {this.state.error && (
                  <details className="text-left">
                    <summary className="text-[13px] text-muted-foreground cursor-pointer mb-2">
                      Error details
                    </summary>
                    <pre className="text-[12px] bg-accent/50 p-4 rounded overflow-auto max-h-40">
                      {this.state.error.message}
                    </pre>
                  </details>
                )}
              </div>
              <div className="flex gap-3">
                <Button
                  onClick={() => window.location.reload()}
                  variant="default"
                >
                  Reload Page
                </Button>
                <Button
                  onClick={() => {
                    this.setState({ hasError: false, error: null });
                  }}
                  variant="outline"
                >
                  Try Again
                </Button>
              </div>
            </div>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}
