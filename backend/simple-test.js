require("dotenv").config();

async function simpleTest() {
  console.log("🧪 Starting simple auth test...");
  
  // First, get a token
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
  
  // Now test the protected endpoint
  console.log("🔐 Testing protected endpoint...");
  const response = await fetch('http://localhost:5000/api/users/history/me', {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  
  console.log(`Status: ${response.status}`);
  
  if (response.ok) {
    const data = await response.json();
    console.log("✅ Success! History entries:", data.length);
  } else {
    const error = await response.json();
    console.log("❌ Error:", error.message);
  }
}

simpleTest().catch(console.error);
