import React from 'react';

function UserSelector({
  users,
  organizations,
  selectedUser,
  selectedOrg,
  onUserChange,
  onOrgChange,
  currentUser,
  currentOrg
}) {
  return (
    <div className="demo-controls">
      <h2>🎯 Context Selection</h2>
      <p style={{ marginBottom: '1.5rem', color: '#6b7280' }}>
        Select different users and organizations to see how LaunchDarkly targeting works.
        This simulates switching between different user contexts in a real application.
      </p>
      
      <div className="user-selector">
        <div className="form-group">
          <label htmlFor="user-select">User Context</label>
          <select
            id="user-select"
            value={selectedUser}
            onChange={(e) => onUserChange(e.target.value)}
          >
            {users.map(user => (
              <option key={user.id} value={user.id}>
                {user.name} ({user.role})
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="org-select">Organization Context</label>
          <select
            id="org-select"
            value={selectedOrg}
            onChange={(e) => onOrgChange(e.target.value)}
          >
            {organizations.map(org => (
              <option key={org.id} value={org.id}>
                {org.name} ({org.tier})
              </option>
            ))}
          </select>
        </div>
      </div>

      {currentUser && currentOrg && (
        <div style={{ 
          marginTop: '1rem', 
          padding: '1rem', 
          background: '#f3f4f6', 
          borderRadius: '8px',
          fontSize: '0.9rem'
        }}>
          <strong>Current Context:</strong> {currentUser.name} ({currentUser.role}) 
          at {currentOrg.name} ({currentOrg.tier} tier, {currentOrg.industry})
        </div>
      )}
    </div>
  );
}

export default UserSelector;

