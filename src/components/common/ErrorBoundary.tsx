import React from "react";
import ErrorFallback from "./ErrorFallback";

interface ErrorBoundaryProps { children: React.ReactNode; resetKey?: string; }
interface ErrorBoundaryState { hasError: boolean; }

/** Catches React render/lifecycle errors; API and event-handler errors need separate handling. */
class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false };
  static getDerivedStateFromError(): ErrorBoundaryState { return { hasError: true }; }
  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error("React error boundary:", error, info.componentStack);
  }
  componentDidUpdate(previousProps: ErrorBoundaryProps) {
    if (this.state.hasError && previousProps.resetKey !== this.props.resetKey) {
      this.setState({ hasError: false });
    }
  }
  render() { return this.state.hasError ? <ErrorFallback /> : this.props.children; }
}
export default ErrorBoundary;
