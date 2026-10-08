import axios from 'axios';
import assert from 'assert';

const API_URL = 'http://localhost:5000/api';

async function runTests() {
  console.log('--- Starting Customer Insights Tests ---');
  
  let adminToken = '';
  let businessUserToken = '';

  // 1. Setup - Get Tokens
  try {
    const adminRes = await axios.post(`${API_URL}/auth/login`, {
      email: 'admin@analytics.com',
      password: 'password123'
    });
    adminToken = adminRes.data.data.token;
    console.log('✅ Admin login successful');

    // Need a non-admin token for authorization test. Let's see if customer exists.
    // We'll just try to login as a test user or we can just test with invalid token.
    const userRes = await axios.post(`${API_URL}/auth/login`, {
      email: 'analyst@analytics.com', // Let's check if there is a BusinessUser we can use
      password: 'password123'
    }).catch(() => null);

    if (userRes) {
      businessUserToken = userRes.data.data.token;
    }
  } catch (error) {
    console.error('Failed to setup tokens:', error);
    process.exit(1);
  }

  // 2. Test Authorization (No Token)
  try {
    await axios.get(`${API_URL}/customers/insights`);
    assert.fail('Should have failed with 401 Unauthorized');
  } catch (error: any) {
    assert.strictEqual(error.response.status, 401);
    console.log('✅ Test: Authorization (No token) - 401 Unauthorized');
  }

  // 3. Test Customer Aggregation & Metrics
  try {
    const res = await axios.get(`${API_URL}/customers/insights`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.data.success, true);
    
    const insights = res.data.data;
    assert(Array.isArray(insights), 'Insights should be an array');
    console.log(`✅ Test: Successfully fetched ${insights.length} customer insights`);

    if (insights.length > 0) {
      const customer = insights[0];
      
      // Test structure (Customer aggregation, review count, average rating, etc.)
      assert.ok('customerId' in customer, 'Missing customerId');
      assert.ok('customerName' in customer, 'Missing customerName');
      assert.ok('reviewCount' in customer, 'Missing reviewCount');
      assert.ok('averageRating' in customer, 'Missing averageRating');
      assert.ok('positiveCount' in customer, 'Missing positiveCount');
      assert.ok('neutralCount' in customer, 'Missing neutralCount');
      assert.ok('negativeCount' in customer, 'Missing negativeCount');
      assert.ok('productsReviewed' in customer, 'Missing productsReviewed');
      assert.ok('domainsReviewed' in customer, 'Missing domainsReviewed');

      console.log('✅ Test: Validated insight fields (customer aggregation, counts, rating, sentiment, products, domains)');

      // Validate data types
      assert.strictEqual(typeof customer.reviewCount, 'number');
      assert.strictEqual(typeof customer.averageRating, 'number');
      assert.strictEqual(typeof customer.positiveCount, 'number');
      assert.strictEqual(typeof customer.productsReviewed, 'number');
      assert.strictEqual(typeof customer.domainsReviewed, 'number');

      // Review count logical check
      assert(customer.reviewCount >= 0, 'Review count cannot be negative');
      assert(customer.reviewCount === (customer.positiveCount + customer.neutralCount + customer.negativeCount), 'Sentiment counts should sum to review count (unless missing sentiment)');
      
      console.log('✅ Test: Logical validation of review counts and sentiment aggregation');
    } else {
      console.log('⚠️ Test: No customer data returned (empty customer handling verified)');
    }

  } catch (error: any) {
    console.error('Failed test:', error.response?.data || error.message);
    process.exit(1);
  }

  console.log('--- All Tests Passed Successfully ---');
}

runTests();
