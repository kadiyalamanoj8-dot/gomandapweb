import React from 'react';
import { ShieldAlert, RefreshCw } from 'lucide-react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ error, errorInfo });
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  handleHardReset = () => {
    // Aggressively clear everything
    localStorage.clear();
    sessionStorage.clear();
    
    // Unregister service workers
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistrations().then(function(registrations) {
        for(let registration of registrations) {
          registration.unregister();
        }
      });
    }

    // Force reload bypassing cache
    window.location.href = window.location.pathname + '?v=' + new Date().getTime();
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-brand-black flex items-center justify-center p-4">
          <div className="bg-white/5 border border-red-500/30 p-8 rounded-3xl max-w-lg w-full text-center shadow-2xl backdrop-blur-xl">
            <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <ShieldAlert size={40} className="text-red-500" />
            </div>
            <h1 className="text-2xl font-black text-white mb-4">Something went wrong.</h1>
            <p className="text-gray-400 mb-8">
              We encountered an unexpected error. This is often caused by a stale browser cache or an interrupted network request.
            </p>
            
            <div className="bg-black/50 p-4 rounded-xl text-left mb-8 overflow-auto max-h-40 border border-white/5">
              <p className="text-red-400 font-mono text-sm">
                {this.state.error && this.state.error.toString()}
              </p>
            </div>

            <button
              onClick={this.handleHardReset}
              className="w-full bg-brand-primary hover:bg-brand-primary/90 text-white font-black py-4 rounded-xl transition-all flex items-center justify-center gap-2"
            >
              <RefreshCw size={20} />
              Clear Cache & Reload App
            </button>
          </div>
        </div>
      );
    }

    return this.props.children; 
  }
}

export default ErrorBoundary;
