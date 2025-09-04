import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log the error details for debugging
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
  }

  render() {
    if (this.state.hasError) {
      // Fallback UI
      return (
        <div className="error-boundary">
          <div className="error-content">
            <h2>🚨 Something went wrong</h2>
            <p>The application encountered an unexpected error. Please refresh the page to try again.</p>
            
            {process.env.NODE_ENV === 'development' && (
              <details className="error-details">
                <summary>Error Details (Development Mode)</summary>
                <pre className="error-stack">
                  {this.state.error && this.state.error.toString()}
                  <br />
                  {this.state.errorInfo.componentStack}
                </pre>
              </details>
            )}
            
            <button 
              className="refresh-button"
              onClick={() => window.location.reload()}
            >
              Refresh Page
            </button>
          </div>
          
          <style jsx>{`
            .error-boundary {
              display: flex;
              justify-content: center;
              align-items: center;
              min-height: 100vh;
              background-color: #f8f9fa;
              padding: 2rem;
            }

            .error-content {
              max-width: 600px;
              text-align: center;
              background: white;
              border-radius: 8px;
              padding: 3rem;
              box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
              border: 1px solid #e9ecef;
            }

            .error-content h2 {
              color: #dc3545;
              margin-bottom: 1rem;
              font-size: 1.5rem;
            }

            .error-content p {
              color: #666;
              margin-bottom: 2rem;
              line-height: 1.6;
            }

            .error-details {
              text-align: left;
              margin: 2rem 0;
              border: 1px solid #e9ecef;
              border-radius: 4px;
              background-color: #f8f9fa;
            }

            .error-details summary {
              padding: 1rem;
              cursor: pointer;
              background-color: #e9ecef;
              border-radius: 4px 4px 0 0;
              font-weight: 500;
            }

            .error-stack {
              padding: 1rem;
              margin: 0;
              font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
              font-size: 0.875rem;
              color: #dc3545;
              white-space: pre-wrap;
              overflow-x: auto;
            }

            .refresh-button {
              background-color: #007bff;
              color: white;
              border: none;
              padding: 0.75rem 1.5rem;
              border-radius: 4px;
              cursor: pointer;
              font-size: 1rem;
              font-weight: 500;
              transition: background-color 0.2s;
            }

            .refresh-button:hover {
              background-color: #0056b3;
            }

            .refresh-button:active {
              background-color: #004085;
            }
          `}</style>
        </div>
      );
    }

    // If no error, render children normally
    return this.props.children;
  }
}

export default ErrorBoundary;
