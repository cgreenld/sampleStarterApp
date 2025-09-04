import React, { useState, useEffect } from 'react';
import { useFlags, useLDClient } from 'launchdarkly-react-client-sdk';
import UserSelector from './UserSelector';
import SimplifiedUI from './SimplifiedUI';
import Header from './Header';

function DemoApp({ fallbackMode = false }) {
  const [selectedUser, setSelectedUser] = useState('user-1');
  const [selectedOrg, setSelectedOrg] = useState('org-megabank');
  const [serverFlags, setServerFlags] = useState({});
  const [demoData, setDemoData] = useState({ users: [], organizations: [] });
  const [error, setError] = useState(null);

  // LaunchDarkly client-side hooks
  const clientFlags = useFlags();
  const ldClient = useLDClient();

  // Fetch demo data (users and organizations)
  useEffect(() => {
    fetch('/api/demo-data')
      .then(response => response.json())
      .then(data => {
        setDemoData(data);
      })
      .catch(err => {
        console.error('Failed to fetch demo data:', err);
        setError('Failed to load demo data');
      });
  }, []);

  // Fetch server-side flags when user or org changes
  useEffect(() => {
    if (selectedUser && selectedOrg) {
      fetch(`/api/flags/${selectedUser}/${selectedOrg}`)
        .then(response => response.json())
        .then(data => {
          setServerFlags(data);
          
          // Log for audit trail
          console.log('[Audit] Server-side flag evaluation:', {
            user: selectedUser,
            organization: selectedOrg,
            flags: data.flags,
            source: data.evaluationSource,
            timestamp: data.timestamp
          });
        })
        .catch(err => {
          console.error('Failed to fetch server flags:', err);
          setError('Failed to load server flags');
        });
    }
  }, [selectedUser, selectedOrg]);

  // Update LaunchDarkly client context when user/org changes
  useEffect(() => {
    if (!fallbackMode && ldClient && selectedUser && selectedOrg) {
      const selectedUserData = demoData.users.find(u => u.id === selectedUser);
      const selectedOrgData = demoData.organizations.find(o => o.id === selectedOrg);
      
      if (selectedUserData && selectedOrgData) {
        const newContext = {
          kind: 'multi',
          user: {
            key: selectedUserData.id,
            name: selectedUserData.name,
            role: selectedUserData.role,
            email: selectedUserData.email,
          },
          organization: {
            key: selectedOrgData.id,
            name: selectedOrgData.name,
            tier: selectedOrgData.tier,
            industry: selectedOrgData.industry
          }
        };

        ldClient.identify(newContext).then(() => {
          console.log('[LD] Client context updated:', newContext);
        }).catch(err => {
          console.error('[LD] Failed to update context:', err);
        });
      }
    }
  }, [selectedUser, selectedOrg, demoData, ldClient, fallbackMode]);


  if (error) {
    return (
      <div className="error-container">
        <h2>Error</h2>
        <p>{error}</p>
      </div>
    );
  }

  const currentUser = demoData.users.find(u => u.id === selectedUser);
  const currentOrg = demoData.organizations.find(o => o.id === selectedOrg);

  return (
    <div className="demo-app">
      <Header />
      
      <UserSelector
        users={demoData.users}
        organizations={demoData.organizations}
        selectedUser={selectedUser}
        selectedOrg={selectedOrg}
        onUserChange={setSelectedUser}
        onOrgChange={setSelectedOrg}
        currentUser={currentUser}
        currentOrg={currentOrg}
      />

      <SimplifiedUI
        currentUser={currentUser}
        currentOrg={currentOrg}
        fallbackMode={fallbackMode}
      />
    </div>
  );
}

export default DemoApp;

