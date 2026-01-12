require("dotenv").config();

async function testSubscriptionsFeed() {
  console.log("🧪 Testing subscriptions feed...");
  
  // Get a token
  const loginResponse = await fetch('http://localhost:5000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'priyanshpatel490@gmail.com' })
  });
  
  if (!loginResponse.ok) {
    console.log("❌ Login failed");
    return;
  }
  
  const { token } = await loginResponse.json();
  console.log("✅ Got token");
  
  // Test subscriptions feed
  console.log("🔐 Testing subscriptions feed...");
  const response = await fetch('http://localhost:5000/api/videos/subscriptions-feed', {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  
  console.log(`Status: ${response.status}`);
  
  if (response.ok) {
    const data = await response.json();
    console.log("✅ Success! Subscriptions feed:", data);
  } else {
    const error = await response.json();
    console.log("❌ Error:", error.message);
  }
}

testSubscriptionsFeed().catch(console.error);
