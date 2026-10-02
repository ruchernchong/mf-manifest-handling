import { Component, type ReactNode } from 'react';

export default class RemoteBoundary extends Component<
  { name: string; children: ReactNode },
  { failed: boolean }
> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  render() {
    if (this.state.failed) {
      return (
        <section role="alert">
          <h2>{this.props.name} is unavailable</h2>
          <p>Start the remote application, then reload this page.</p>
          <button type="button" onClick={() => window.location.reload()}>
            Reload page
          </button>
        </section>
      );
    }
    return this.props.children;
  }
}
