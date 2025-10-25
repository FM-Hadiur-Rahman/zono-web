// src/components/AppErrorBoundary.jsx
import { Component } from "react";

export class AppErrorBoundary extends Component {
  state = { hasError: false };
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  componentDidCatch(err) {
    console.error(err);
  }
  render() {
    if (this.state.hasError)
      return <div>Something went wrong. Please reload.</div>;
    return this.props.children;
  }
}
