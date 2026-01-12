require("dotenv").config();

async function testAuth() {
  try {
    console.log("🧪 Testing auth endpoint...");
    
    // Test login to get valid token
    console.log("\n1. Testing login to get valid token:");
    const loginResponse = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email: 'priyanshpatel490@gmail.com' })
    });
    
    if (loginResponse.ok) {
      const loginData = await loginResponse.json();
      console.log("Login successful, got token");
      console.log("Token length:", loginData.token.length);
      
      // Decode JWT to see payload
      const parts = loginData.token.split('.');
      const payload = JSON.parse(Buffer.from(parts[1], 'base64url').toString());
      console.log("JWT Payload:", payload);
      
      // Test with valid token
      console.log("\n2. Testing with valid token:");
      const response3 = await fetch('http://localhost:5000/api/users/history/me', {
        headers: {
          'Authorization': `Bearer ${loginData.token}`
        }
      });
      console.log(`Status: ${response3.status}`);
      
      if (response3.ok) {
        const data = await response3.json();
        console.log("✅ Auth working! History entries:", data.length);
      } else {
        const errorData = await response3.json();
        console.log("❌ Error:", errorData.message);
      }
    } else {
      console.log("❌ Login failed");
    }
    
  } catch (error) {
    console.error("❌ Test failed:", error.message);
  }
}

testAuth();
