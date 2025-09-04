# 🚀 LaunchDarkly FinTech Demo

A comprehensive full-stack sample application demonstrating LaunchDarkly best practices for financial services, showcasing secure feature flag implementation with both server-side and client-side evaluation.

## 🎯 Overview

This demo application illustrates:

- **Server-side vs Client-side Flag Evaluation**: Understanding when and how to use each approach
- **Multi-Context Targeting**: Using LaunchDarkly's `LDContext` with multiple kinds (user + organization)
- **Security Best Practices**: Protecting PII with `privateAttributes` and secure evaluation patterns
- **Audit Trail**: Compliance-focused logging for financial services
- **Fallback Behavior**: Graceful degradation when LaunchDarkly is unavailable

## 🏗️ Architecture

```
📁 Project Structure
├── 📁 client/          # React frontend with Vite
│   ├── src/
│   │   ├── components/  # React components
│   │   ├── App.jsx     # LaunchDarkly provider setup
│   │   └── main.jsx    # React entry point
│   └── package.json
├── 📁 server/          # Node.js backend with Fastify
│   ├── src/
│   │   └── index.js    # Server with LD server SDK
│   └── package.json
├── package.json        # Root package with scripts
└── env.example         # Environment configuration template
```

## 🚦 Tech Stack

### Backend
- **Node.js** with **Fastify** framework
- **LaunchDarkly Node Server SDK** (`launchdarkly-node-server-sdk`)
- **ES Modules** for modern JavaScript

### Frontend  
- **React 18** with **Vite** for fast development
- **LaunchDarkly React Client SDK** (`launchdarkly-react-client-sdk`)
- **Modern CSS** with responsive design

## 🔧 Setup Instructions

### Prerequisites
- Node.js 18+ 
- npm or yarn
- LaunchDarkly account with a project

### 1. Clone and Install Dependencies

```bash
# Clone or download this repository
cd sampleStarterApp

# Install all dependencies (both client and server)
npm run install:all

# Alternative: install individually
npm run server:install
npm run client:install
```

### 2. LaunchDarkly Configuration

1. **Create a LaunchDarkly Project** at [app.launchdarkly.com](https://app.launchdarkly.com)

2. **Get Your SDK Keys**:
   - Go to Account Settings → Projects → [Your Project] → Environments
   - Copy the **Server-side SDK key** (starts with `sdk-`)
   - Copy the **Client-side ID** (shorter, alphanumeric)

3. **Create Feature Flags** in your LaunchDarkly project:
   ```
   Flag Key: show-new-dashboard
   Flag Key: enable-fraud-detection  
   Flag Key: advanced-analytics
   ```

4. **Set Up Environment Variables**:
   ```bash
   # Copy the example environment file
   cp env.example .env
   cp server/env.example server/.env
   
   # Edit .env files with your actual LaunchDarkly keys
   ```

   Example `.env` content:
   ```env
   LAUNCHDARKLY_SDK_KEY=sdk-12345678-1234-1234-1234-123456789012
   LAUNCHDARKLY_CLIENT_SDK_KEY=64a123b456c789d012e345f678
   PORT=3001
   CLIENT_URL=http://localhost:5173
   ```

### 3. Start the Application

```bash
# Start both client and server concurrently
npm run dev

# Or start individually:
npm run server:dev  # Server on http://localhost:3001
npm run client:dev  # Client on http://localhost:5173
```

The application will be available at `http://localhost:5173`

## 🎮 Demo Features

### User Context Simulation
- Switch between different users (analyst, manager, admin roles)
- Switch between organizations (different tiers: starter, enterprise)
- See how targeting rules affect feature availability

### Feature Showcase
1. **📊 New Dashboard** (Server-side evaluation)
   - Sensitive business feature
   - Secure server-side evaluation prevents tampering

2. **🛡️ Advanced Fraud Detection** (Server-side evaluation)  
   - Critical security feature
   - Server-side ensures business logic is protected

3. **📈 Advanced Analytics** (Client-side evaluation)
   - UI enhancement feature
   - Real-time updates for better user experience

### Flag Status Panel
- **Real-time comparison** of server-side vs client-side evaluations
- **Source indication** (LaunchDarkly vs fallback)
- **Security rationale** for each evaluation method

## 🔒 Security Best Practices

### 1. LDContext with Multi-Kind

```javascript
// Server-side context creation
const context = {
  kind: 'multi',
  user: {
    key: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
  },
  organization: {
    key: organization.id,
    name: organization.name,
    tier: organization.tier,
    industry: organization.industry
  }
};
```

### 2. Server-side vs Client-side Evaluation

| **Server-side** | **Client-side** |
|-----------------|-----------------|
| ✅ Secure business logic | ✅ Real-time UI updates |
| ✅ Authoritative evaluation | ✅ Reduced server load |
| ✅ PII protection | ✅ Better user experience |
| ✅ Audit trail | ⚠️ Flags visible to users |

### 4. Fallback Behavior

```javascript
// Always provide sensible defaults
const isFeatureEnabled = await ldClient.variation(
  'feature-flag-key', 
  context, 
  false  // 🔒 Default to secure/off state
);
```

## 📊 Audit Trail & Compliance

The application logs all flag evaluations for compliance:

```javascript
// Server-side audit logging
fastify.log.info({
  action: 'flag_evaluation',
  userId: user.id,
  userRole: user.role,
  organizationId: organization.id,
  flags: evaluatedFlags,
  timestamp: new Date().toISOString()
}, 'Flag evaluation completed');
```

## 🎯 LaunchDarkly Targeting Examples

### Example Targeting Rules

1. **Role-based Targeting**:
   ```
   If user.role is "manager" or "admin"
   Then serve: true
   ```

2. **Organization Tier Targeting**:
   ```
   If organization.tier is "enterprise"
   Then serve: true
   ```

3. **Multi-condition Targeting**:
   ```
   If user.role is "admin" AND organization.industry is "banking"
   Then serve: true
   ```

## 🔍 API Endpoints

### Server Endpoints

- `GET /health` - Health check with LaunchDarkly status
- `GET /api/demo-data` - Available users and organizations  
- `GET /api/flags/:userId/:orgId` - Server-side flag evaluation
- `GET /api/client-sdk-key` - Client SDK key for frontend

### Example API Response

```json
{
  "flags": {
    "show-new-dashboard": true,
    "enable-fraud-detection": false,
    "advanced-analytics": true
  },
  "context": {
    "user": { "id": "user-1", "name": "John Smith", "role": "manager" },
    "organization": { "id": "org-megabank", "name": "MegaBank", "tier": "enterprise" }
  },
  "evaluationSource": "launchdarkly",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

## 🚀 Production Deployment

### Environment Considerations

1. **Use Environment-Specific SDK Keys**
   - Development, staging, and production should have separate LaunchDarkly environments

2. **Secure SDK Key Storage**
   ```bash
   # Use secure secret management
   export LAUNCHDARKLY_SDK_KEY=$(aws ssm get-parameter --name "/app/ld-sdk-key" --with-decryption --query Parameter.Value --output text)
   ```

3. **IP Restrictions** (Client SDK)
   - Configure allowed domains/IPs in LaunchDarkly project settings

4. **Rate Limiting**
   - Implement rate limiting on flag evaluation endpoints

### Docker Deployment

```dockerfile
# Example Dockerfile for server
FROM node:18-alpine
WORKDIR /app
COPY server/package*.json ./
RUN npm ci --only=production
COPY server/src ./src
CMD ["npm", "start"]
```

## 🔧 Development

### Adding New Feature Flags

1. **Create flag in LaunchDarkly dashboard**
2. **Add to server evaluation** in `server/src/index.js`
3. **Add to client components** for UI features
4. **Update feature definitions** in `FeatureShowcase.jsx`

### Testing Strategies

```javascript
// Unit test example
test('server returns fallback when LD unavailable', async () => {
  // Mock LaunchDarkly client to be null
  const response = await request(app).get('/api/flags/user-1/org-megabank');
  expect(response.body.evaluationSource).toBe('fallback');
  expect(response.body.flags['show-new-dashboard']).toBe(false);
});
```

## 🤝 Financial Services Compliance

### SOC 2 Considerations
- ✅ Audit logging of all flag evaluations
- ✅ PII protection via privateAttributes  
- ✅ Secure server-side evaluation for sensitive features
- ✅ Fallback behavior for system resilience

### PCI DSS Considerations  
- ✅ No sensitive data in client-side flags
- ✅ Server-side evaluation for payment-related features
- ✅ Audit trail for compliance reporting

## 📚 Additional Resources

- [LaunchDarkly Documentation](https://docs.launchdarkly.com/)
- [Node.js Server SDK Guide](https://docs.launchdarkly.com/sdk/server-side/node-js)
- [React Client SDK Guide](https://docs.launchdarkly.com/sdk/client-side/react)
- [Multi-Context Documentation](https://docs.launchdarkly.com/home/contexts)

## 🐛 Troubleshooting

### Common Issues

1. **"LaunchDarkly client not initialized"**
   - Check SDK key format and network connectivity
   - Verify environment variables are loaded

2. **Client-side flags not updating**
   - Check browser console for WebSocket errors
   - Verify client SDK key permissions

### Debug Mode

Enable debug logging:
```javascript
// Server-side
const ldClient = LaunchDarkly.init(sdkKey, {
  logger: LaunchDarkly.basicLogger({ level: 'debug' })
});

// Client-side  
options: {
  logger: { log: (level, message) => console.log(`[LD ${level}] ${message}`) }
}
```

---

Built with ❤️ for financial services developers using LaunchDarkly