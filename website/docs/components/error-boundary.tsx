// website/docs/components/ErrorBoundary.tsx
import React from "react";

type Props = {
  children: React.ReactNode;
  fallback?: React.ReactNode;
};

type State = {
  hasError: boolean;
};

export default class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(_: Error) {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // 你可以在这里上报错误日志
    // console.error(error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || null; // 你可以自定义兜底内容
    }
    return this.props.children;
  }
}
