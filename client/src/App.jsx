import React, { useState, useEffect } from 'react';
import { withLDProvider } from 'launchdarkly-react-client-sdk';
import DemoApp from './components/DemoApp';
import ErrorBoundary from './components/ErrorBoundary';

// App component that will be wrapped with LaunchDarkly provider
function App() {
  return (
    <ErrorBoundary>
      <div className="app">
        <DemoApp />
      </div>
    </ErrorBoundary>
  );
}

// Configuration component to handle LaunchDarkly initialization
function AppWithLDProvider() {
  const [ldConfig, setLdConfig] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Fetch client SDK key from server
    fetch('/api/client-sdk-key')
      .then(response => {
        if (!response.ok) {
          throw new Error('Failed to fetch client SDK key');
        }
        return response.json();
      })
      .then(data => {
        // Default context for LaunchDarkly client initialization
        // This will be updated when user selects different user/org
        const defaultContext = {
          kind: 'multi',
          user: {
            key: 'anonymous',
            name: 'Anonymous User',
            anonymous: true
          },
          organization: {
            key: 'demo-org',
            name: 'Demo Organization',
            tier: 'starter'
          }
        };

        setLdConfig({
          clientSideID: data.clientSdkKey,
          context: defaultContext,
          options: {
            sendEventsOnlyForVariation: true,
          }
        });
      })
      .catch(err => {
        console.error('Failed to initialize LaunchDarkly:', err);
        setError(err.message);
      });
  }, []);


  if (error) {
    return (
      <div className="error-container">
        <h2>Initialization Error</h2>
        <p>Failed to initialize LaunchDarkly client: {error}</p>
        <p>The application will continue with fallback values.</p>
        <DemoApp fallbackMode={true} />
      </div>
    );
  }

  if (!ldConfig) {
    return (
      <div className="error-container">
        <h2>Configuration Error</h2>
        <p>LaunchDarkly configuration is not available.</p>
        <DemoApp fallbackMode={true} />
      </div>
    );
  }

  // Create the LaunchDarkly-wrapped component
  const LDApp = withLDProvider(ldConfig)(App);
  return <LDApp />;
}

export default AppWithLDProvider;

