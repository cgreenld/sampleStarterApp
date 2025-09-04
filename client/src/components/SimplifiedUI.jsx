import React from 'react';
import { useFlags, useLDClient } from 'launchdarkly-react-client-sdk';

function SimplifiedUI({ currentUser, currentOrg, fallbackMode }) {
  const clientFlags = useFlags();
  const ldClient = useLDClient();

  // Create the context structure that matches what's sent to LaunchDarkly
  const currentContext = {
    kind: 'multi',
    user: {
      key: currentUser?.id || 'anonymous',
      name: currentUser?.name || 'Anonymous User',
      role: currentUser?.role || 'unknown',
    },
    organization: {
      key: currentOrg?.id || 'demo-org',
      name: currentOrg?.name || 'Demo Organization',
      tier: currentOrg?.tier || 'starter',
      industry: currentOrg?.industry || 'unknown'
    }
  };

  // Get flag values - use fallback if in fallback mode
  const flagValues = fallbackMode ? {
    'show-new-dashboard': false,
    'enable-fraud-detection': false,
    'advanced-analytics': false
  } : clientFlags;

  return (
    <div className="simplified-ui">
      <div className="two-column-layout">
        {/* Left Column - Context JSON */}
        <div className="context-column">
          <h2>📋 Current Context</h2>
          <p style={{ color: '#6b7280', marginBottom: '1rem' }}>
            This is the context structure sent to LaunchDarkly for flag evaluation
          </p>
          
          <div className="json-container">
            <pre className="json-display">
              {JSON.stringify(currentContext, null, 2)}
            </pre>
          </div>

          <div className="context-info">
            <h3>Context Details</h3>
            <ul>
              <li><strong>User:</strong> {currentUser?.name || 'Anonymous'} ({currentUser?.role || 'unknown'})</li>
              <li><strong>Organization:</strong> {currentOrg?.name || 'Demo Organization'}</li>
              <li><strong>Tier:</strong> {currentOrg?.tier || 'starter'}</li>
              <li><strong>Industry:</strong> {currentOrg?.industry || 'unknown'}</li>
            </ul>
          </div>
        </div>

        {/* Right Column - Flag Values */}
        <div className="flags-column">
          <h2>🚩 Client-Side Flag Values</h2>
          <p style={{ color: '#6b7280', marginBottom: '1rem' }}>
            Flag values as evaluated by the LaunchDarkly client SDK
            {fallbackMode && ' (Fallback mode - LaunchDarkly unavailable)'}
          </p>

          <div className="flags-container">
            {Object.entries(flagValues).map(([flagKey, flagValue]) => (
              <div key={flagKey} className={`flag-item ${flagValue ? 'enabled' : 'disabled'}`}>
                <div className="flag-header">
                  <span className="flag-name">{flagKey}</span>
                  <span className={`flag-status ${flagValue ? 'true' : 'false'}`}>
                    {flagValue ? 'true' : 'false'}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="flags-info">
            <h3>Source Information</h3>
            <ul>
              <li><strong>Evaluation:</strong> Client-side</li>
              <li><strong>Source:</strong> {fallbackMode ? 'Fallback values' : 'LaunchDarkly streaming'}</li>
              <li><strong>Real-time updates:</strong> {fallbackMode ? 'No' : 'Yes'}</li>
              <li><strong>Connected:</strong> {ldClient ? 'Yes' : 'No'}</li>
            </ul>
          </div>
        </div>
      </div>

      <style jsx>{`
        .simplified-ui {
          max-width: 1200px;
          margin: 0 auto;
          padding: 2rem;
        }

        .two-column-layout {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 2rem;
          margin-top: 2rem;
        }

        .context-column,
        .flags-column {
          background: white;
          border-radius: 8px;
          padding: 1.5rem;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          border: 1px solid #e5e7eb;
        }

        .context-column h2,
        .flags-column h2 {
          margin: 0 0 0.5rem 0;
          color: #1f2937;
          font-size: 1.5rem;
        }

        .json-container {
          background: #f8f9fa;
          border: 1px solid #e9ecef;
          border-radius: 6px;
          padding: 1rem;
          margin: 1rem 0;
          overflow-x: auto;
        }

        .json-display {
          margin: 0;
          font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
          font-size: 0.875rem;
          line-height: 1.5;
          color: #374151;
          white-space: pre-wrap;
        }

        .context-info,
        .flags-info {
          background: #f9fafb;
          border-radius: 6px;
          padding: 1rem;
          margin-top: 1rem;
        }

        .context-info h3,
        .flags-info h3 {
          margin: 0 0 0.75rem 0;
          color: #374151;
          font-size: 1rem;
        }

        .context-info ul,
        .flags-info ul {
          margin: 0;
          padding-left: 1.25rem;
          color: #4b5563;
        }

        .context-info li,
        .flags-info li {
          margin-bottom: 0.5rem;
        }

        .flags-container {
          space: 1rem 0;
        }

        .flag-item {
          background: #f8f9fa;
          border: 2px solid #e9ecef;
          border-radius: 6px;
          padding: 1rem;
          margin-bottom: 0.75rem;
          transition: all 0.2s ease;
        }

        .flag-item.enabled {
          background: #ecfdf5;
          border-color: #10b981;
        }

        .flag-item.disabled {
          background: #fef2f2;
          border-color: #ef4444;
        }

        .flag-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .flag-name {
          font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
          font-size: 0.875rem;
          color: #374151;
          font-weight: 500;
        }

        .flag-status {
          padding: 0.25rem 0.75rem;
          border-radius: 9999px;
          font-size: 0.75rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .flag-status.true {
          background: #10b981;
          color: white;
        }

        .flag-status.false {
          background: #ef4444;
          color: white;
        }

        @media (max-width: 768px) {
          .two-column-layout {
            grid-template-columns: 1fr;
            gap: 1rem;
          }

          .simplified-ui {
            padding: 1rem;
          }
        }
      `}</style>
    </div>
  );
}

export default SimplifiedUI;
