import { Button } from "@heroui/react";
import { Component, type ErrorInfo, type ReactNode } from "react";
import { fiscal } from "../lib/fiscal";

type Props = { children: ReactNode };
type State = { error: Error | null };

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("MkopoFlow UI error:", error, info.componentStack);
  }

  render() {
    if (this.state.error) {
      return (
        <div
          className={`flex min-h-screen flex-col items-center justify-center gap-4 ${fiscal.bgSurface} px-6`}
        >
          <h1 className="fiscal-heading text-xl">Something went wrong</h1>
          <p className="fiscal-label max-w-md text-center text-sm">
            {this.state.error.message}
          </p>
          <Button variant="primary" onPress={() => window.location.reload()}>
            Reload page
          </Button>
        </div>
      );
    }
    return this.props.children;
  }
}
