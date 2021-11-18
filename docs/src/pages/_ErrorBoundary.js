import React from 'react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  // eslint-disable-next-line no-unused-vars
  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI.
    return { hasError: true };
  }

  // eslint-disable-next-line no-unused-vars
  componentDidCatch(error, errorInfo) {
    // eslint-disable-next-line no-console
    console.log('Error rendering demo markdown description.');
  }

  render() {
    const { hasError } = this.state;
    if (hasError) {
      // Quietly error.
      return null;
    }
    const { children } = this.props;
    return children;
  }
}
