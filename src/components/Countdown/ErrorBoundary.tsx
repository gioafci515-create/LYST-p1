import { Component, type ReactNode } from 'react';

interface Props {
  fallback: ReactNode;
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

/** Countdown must never render nothing. If anything in it throws — for any
 *  reason, on any device — this swaps to a plain static fallback instead
 *  of letting React unmount the subtree silently. */
export class CountdownErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: unknown): void {
    console.error('[countdown] render error, showing static fallback:', error);
  }

  render(): ReactNode {
    return this.state.hasError ? this.props.fallback : this.props.children;
  }
}
