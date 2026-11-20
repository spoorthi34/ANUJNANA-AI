import { Component, type ErrorInfo, type ReactNode } from "react";
import { AlertTriangle, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

type Props = { children: ReactNode };
type State = { error: Error | null };

/**
 * Keeps a render-time crash (for example a stale browser tab holding two copies of
 * React after a dependency re-bundle) from blanking the whole screen. Instead of an
 * empty page the student sees a short message and a way back into the lesson.
 */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("Lesson screen failed to render:", error, info.componentStack);
  }

  private reload = () => {
    window.location.reload();
  };

  private backToStart = () => {
    window.location.assign("/");
  };

  render() {
    if (!this.state.error) return this.props.children;

    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-6 py-12">
        <div className="w-full max-w-md rounded-3xl border border-border bg-card p-8 text-center shadow-sm">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <AlertTriangle className="h-7 w-7" aria-hidden="true" />
          </div>
          <h1 className="mt-5 font-display text-2xl font-bold text-foreground">
            This page needs a refresh
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            Something went wrong while loading your lesson. Your progress is safe — reload to
            continue where you left off.
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Button onClick={this.reload} className="gap-2">
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reload page
            </Button>
            <Button variant="outline" onClick={this.backToStart} className="gap-2">
              Back to course
            </Button>
          </div>
        </div>
      </div>
    );
  }
}

export default ErrorBoundary;
