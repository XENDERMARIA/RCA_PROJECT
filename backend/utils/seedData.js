const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const RCA = require('../models/RCA');

const sampleRCAs = [
  {
    title: 'Production Database Connection Timeout',
    category: 'Database',
    symptoms: 'Application showing "Connection timeout" errors. Users unable to login. API response times exceeding 30 seconds.',
    rootCause: 'Connection pool exhaustion due to unclosed database connections in the user service microservice. A recent code change introduced a bug where connections were not properly released after transactions.',
    solution: '1. Identified the problematic code in user-service/db.js\n2. Fixed the connection release logic\n3. Deployed hotfix to production\n4. Restarted all affected pods to clear stale connections',
    prevention: 'Implement connection pool monitoring with alerts when utilization exceeds 80%. Add automated connection leak detection in CI/CD pipeline. Code review checklist updated to include connection handling verification.',
    severity: 'Critical',
    status: 'Resolved',
    tags: ['database', 'connection-pool', 'timeout', 'mongodb'],
    createdBy: 'John Doe'
  },
  {
    title: 'API Gateway 502 Bad Gateway Errors',
    category: 'Server',
    symptoms: 'Intermittent 502 errors on /api/v2/* endpoints. Errors occur during peak traffic hours (2-4 PM EST). Approximately 5% of requests affected.',
    rootCause: 'Kubernetes pod resource limits were set too low for the API gateway service. During peak traffic, pods were hitting memory limits and being OOM killed.',
    solution: '1. Increased memory limits from 512Mi to 1Gi\n2. Increased replica count from 3 to 5\n3. Added horizontal pod autoscaler (HPA) configuration\n4. Implemented graceful shutdown handling',
    prevention: 'Set up resource monitoring dashboards. Configure alerts for pod restarts. Implement load testing as part of release process. Regular capacity planning reviews.',
    severity: 'High',
    status: 'Resolved',
    tags: ['kubernetes', 'api-gateway', '502', 'oom'],
    createdBy: 'Jane Smith'
  },
  {
    title: 'SSL Certificate Expiration Causing Service Outage',
    category: 'Network',
    symptoms: 'All HTTPS traffic failing with SSL_ERROR_EXPIRED_CERT_ALERT. Mobile apps showing "Cannot verify server identity". Complete service unavailability.',
    rootCause: 'Production SSL certificate expired. Certificate renewal reminder emails were going to a deprecated team distribution list. No automated monitoring for certificate expiration.',
    solution: '1. Immediately renewed SSL certificate with CA\n2. Deployed new certificate to load balancers\n3. Cleared CDN cache\n4. Verified service restoration',
    prevention: 'Implement automated certificate monitoring using cert-manager. Set up multiple notification channels (Slack, PagerDuty, email). Create certificate expiration dashboard. Switch to auto-renewing certificates where possible.',
    severity: 'Critical',
    status: 'Resolved',
    tags: ['ssl', 'certificate', 'outage', 'https'],
    createdBy: 'Mike Johnson'
  },
  {
    title: 'Memory Leak in Node.js Application',
    category: 'App',
    symptoms: 'Gradual increase in memory usage over 24-48 hours. Eventually leads to application crashes. Heap dumps show growing number of detached DOM nodes.',
    rootCause: 'Event listeners in the websocket handler were not being properly removed when connections closed. Each disconnected client left orphaned listeners consuming memory.',
    solution: '1. Added proper cleanup in connection close handlers\n2. Implemented WeakMap for storing connection metadata\n3. Added memory usage logging\n4. Deployed fix with rolling restart',
    prevention: 'Add memory usage monitoring with alerts at 70% threshold. Implement automated heap dump collection. Regular profiling as part of performance testing. Code review focus on event listener cleanup.',
    severity: 'Medium',
    status: 'Resolved',
    tags: ['memory-leak', 'nodejs', 'websocket', 'event-listeners'],
    createdBy: 'Sarah Williams'
  },
  {
    title: 'Redis Cache Cluster Failover Issues',
    category: 'Database',
    symptoms: 'Session data intermittently unavailable. Users being logged out randomly. High latency spikes every few minutes.',
    rootCause: 'Redis Sentinel was misconfigured with incorrect quorum settings. When primary node experienced brief network blip, Sentinel initiated unnecessary failover, but secondary was not fully synced.',
    solution: '1. Corrected Sentinel quorum configuration\n2. Enabled Redis persistence (AOF) on all nodes\n3. Increased replication timeout values\n4. Tested failover procedure',
    prevention: 'Document Redis cluster architecture. Regular failover testing (chaos engineering). Monitor replication lag. Implement circuit breaker for cache operations.',
    severity: 'High',
    status: 'Resolved',
    tags: ['redis', 'cache', 'sentinel', 'failover'],
    createdBy: 'Tom Brown'
  },
  {
    title: 'Cross-Site Scripting (XSS) Vulnerability in User Profile',
    category: 'Security',
    symptoms: 'Security audit identified stored XSS in user bio field. Malicious scripts could execute when viewing profiles. No known exploitation in production.',
    rootCause: 'User input in biography field was not being sanitized before storage or properly escaped during rendering. React dangerouslySetInnerHTML was used without sanitization.',
    solution: '1. Implemented DOMPurify for input sanitization\n2. Removed dangerouslySetInnerHTML usage\n3. Added Content Security Policy headers\n4. Sanitized all existing user bio entries in database',
    prevention: 'Security training for developers. Automated security scanning in CI/CD. Regular penetration testing. Input validation library standardization across projects.',
    severity: 'High',
    status: 'Resolved',
    tags: ['security', 'xss', 'vulnerability', 'sanitization'],
    createdBy: 'Alex Chen'
  }
];

const seedDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/rca-system');
    console.log('Connected to MongoDB');

    // Clear existing data
    await RCA.deleteMany({});
    console.log('Cleared existing RCAs');

    // Insert sample data
    const createdRCAs = await RCA.insertMany(sampleRCAs);
    console.log(`Created ${createdRCAs.length} sample RCAs`);

    console.log('✅ Database seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();
