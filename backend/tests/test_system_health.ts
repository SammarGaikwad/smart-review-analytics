import axios from 'axios';
import assert from 'assert';

const API_URL = 'http://localhost:5000/api';

async function runTests() {
  console.log('--- Starting System Health Monitoring Tests ---');

  // 1. Test: All services healthy & Response format
  try {
    // Note: /health is generally unprotected, so we don't need a token
    const res = await axios.get(`${API_URL}/health`);
    
    assert.strictEqual(res.status, 200, 'Health endpoint should return 200 OK');
    
    const data = res.data;
    
    // Test: Response format
    assert.ok(data.status, 'Missing overall status');
    assert.ok(data.services, 'Missing services object');
    assert.ok(data.services.backend, 'Missing backend service status');
    assert.ok(data.services.database, 'Missing database service status');
    assert.ok(data.services.analytics, 'Missing analytics service status');
    assert.ok(data.timestamp, 'Missing timestamp');

    // Test: Metric calculation exists
    assert.strictEqual(typeof data.services.backend.uptime, 'number', 'Backend uptime should be a number');
    assert.strictEqual(typeof data.services.database.responseTimeMs, 'number', 'Database responseTimeMs should be a number');
    assert.strictEqual(typeof data.services.analytics.responseTimeMs, 'number', 'Analytics responseTimeMs should be a number');

    // Test: No secrets exposed
    const responseString = JSON.stringify(data);
    assert.strictEqual(responseString.includes('password'), false, 'Should not expose passwords');
    assert.strictEqual(responseString.includes('DATABASE_URL'), false, 'Should not expose DATABASE_URL');
    assert.strictEqual(responseString.includes('postgresql://'), false, 'Should not expose DB connection string');
    
    console.log('✅ Test: System Health format, metrics, and security verified.');

  } catch (error: any) {
    console.error('Failed test:', error.message);
    process.exit(1);
  }

  console.log('--- All System Health Tests Passed Successfully ---');
}

runTests();
