import React from 'react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    // Update state so the next render will show the fallback UI.
    return { hasError: true };
  }

  // eslint-disable-next-line class-methods-use-this
  componentDidCatch(error) {
    console.warn('Spatial view failed to load:', error);
  }

  render() {
    const { hasError } = this.state;
    const { children, fallback } = this.props;
    if (hasError) {
      // You can render any custom fallback UI
      return fallback;
    }
    return children;
  }
}
