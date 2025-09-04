import Fastify from 'fastify';
import cors from '@fastify/cors';
import * as LaunchDarkly from 'launchdarkly-node-server-sdk';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const fastify = Fastify({
  logger: {
    level: 'info',
    transport: {
      target: 'pino-pretty'
    }
  }
});

// LaunchDarkly client
let ldClient;

// CORS configuration for development
await fastify.register(cors, {
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
});

// Initialize LaunchDarkly client
async function initializeLaunchDarkly() {
  const sdkKey = process.env.LAUNCHDARKLY_SDK_KEY;
  console.log('sdkKey', sdkKey);
  if (!sdkKey) {
    fastify.log.warn('LaunchDarkly SDK key not provided. Using fallback values.');
    return null;
  }

  try {
    ldClient = LaunchDarkly.init(sdkKey, {
      logger: LaunchDarkly.basicLogger({
        level: 'info'
      }),
      // For financial services, we want consistent behavior
      offline: false,
      sendEvents: true,
      // Enable streaming for real-time updates
      stream: true,
      // Cache TTL for performance
      cacheTTL: 30
    });

    await ldClient.waitForInitialization();
    fastify.log.info('LaunchDarkly client initialized successfully');
    return ldClient;
  } catch (error) {
    fastify.log.error('Failed to initialize LaunchDarkly client:', error);
    return null;
  }
}

// Helper function to create LDContext with multi-kind
function createLDContext(user, organization) {
  return {
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
}

// Mock user and organization data (in real app, this would come from database/auth)
const mockUsers = {
  'user-1': {
    id: 'user-1',
    name: 'John Smith',
    email: 'john.smith@megabank.com', 
    role: 'analyst'
  },
  'user-2': {
    id: 'user-2',
    name: 'Jane Doe',
    email: 'jane.doe@megabank.com', 
    role: 'manager'
  },
  'user-3': {
    id: 'user-3',
    name: 'Bob Wilson',
    email: 'bob.wilson@smallcorp.com',
    role: 'admin'
  }
};

const mockOrganizations = {
  'org-megabank': {
    id: 'org-megabank',
    name: 'MegaBank Corp',
    tier: 'enterprise',
    industry: 'banking'
  },
  'org-smallcorp': {
    id: 'org-smallcorp',
    name: 'Small Corp',
    tier: 'starter',
    industry: 'fintech'
  }
};

// Health check endpoint
fastify.get('/health', async (request, reply) => {
  return {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    launchDarkly: ldClient ? 'connected' : 'disconnected'
  };
});

// Get available users and organizations
fastify.get('/api/demo-data', async (request, reply) => {
  return {
    users: Object.values(mockUsers).map(user => ({
      id: user.id,
      name: user.name,
      role: user.role
    })),
    organizations: Object.values(mockOrganizations)
  };
});

// Server-side flag evaluation endpoint
fastify.get('/api/flags/:userId/:orgId', async (request, reply) => {
  const { userId, orgId } = request.params;
  
  const user = mockUsers[userId];
  const organization = mockOrganizations[orgId];
  
  if (!user || !organization) {
    return reply.code(404).send({
      error: 'User or organization not found'
    });
  }

  const context = createLDContext(user, organization);
  
  // Default fallback values for when LaunchDarkly is unavailable
  const defaultFlags = {
    'show-new-dashboard': false,
    'enable-fraud-detection': false,
    'advanced-analytics': false
  };

  let flags = { ...defaultFlags };
  let evaluationSource = 'fallback';

  if (ldClient) {
    try {
      // Server-side evaluation - secure and authoritative
      flags['show-new-dashboard'] = await ldClient.variation(
        'show-new-dashboard',
        context,
        defaultFlags['show-new-dashboard']
      );
      
      flags['enable-fraud-detection'] = await ldClient.variation(
        'enable-fraud-detection',
        context,
        defaultFlags['enable-fraud-detection']
      );
      
      flags['advanced-analytics'] = await ldClient.variation(
        'advanced-analytics',
        context,
        defaultFlags['advanced-analytics']
      );

      evaluationSource = 'launchdarkly';
      
      // Audit log for compliance
      fastify.log.info({
        action: 'flag_evaluation',
        userId: user.id,
        userRole: user.role,
        organizationId: organization.id,
        organizationTier: organization.tier,
        flags: flags,
        source: evaluationSource,
        timestamp: new Date().toISOString()
      }, 'Server-side flag evaluation completed');
      
    } catch (error) {
      fastify.log.error('Error evaluating flags:', error);
      // Fall back to default values on error
      evaluationSource = 'fallback_error';
    }
  }

  return {
    flags,
    context: {
      user: {
        id: user.id,
        name: user.name,
        role: user.role
        // email is intentionally excluded from response
      },
      organization: {
        id: organization.id,
        name: organization.name,
        tier: organization.tier,
        industry: organization.industry
      }
    },
    evaluationSource,
    timestamp: new Date().toISOString()
  };
});

// Generate client-side SDK key endpoint (for demo purposes)
// In production, this would be handled more securely
fastify.get('/api/client-sdk-key', async (request, reply) => {
  const clientSdkKey = process.env.LAUNCHDARKLY_CLIENT_SDK_KEY;
  console.log('clientSdkKey', clientSdkKey);
  if (!clientSdkKey) {
    return reply.code(503).send({
      error: 'Client SDK key not configured'
    });
  }
  
  return {
    clientSdkKey
  };
});

// Start server
const start = async () => {
  try {
    // Initialize LaunchDarkly
    await initializeLaunchDarkly();
    
    const port = process.env.PORT || 3001;
    const host = process.env.HOST || '0.0.0.0';
    
    await fastify.listen({ port, host });
    fastify.log.info(`Server running on http://${host}:${port}`);
  } catch (error) {
    fastify.log.error(error);
    process.exit(1);
  }
};

// Graceful shutdown
process.on('SIGINT', async () => {
  fastify.log.info('Received SIGINT, shutting down gracefully...');
  
  if (ldClient) {
    await ldClient.close();
    fastify.log.info('LaunchDarkly client closed');
  }
  
  await fastify.close();
  process.exit(0);
});

start();

