require("dotenv").config();

async function testUpload() {
  console.log("🧪 Testing upload endpoint...");
  
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
  
  // Test upload endpoint (without actual file)
  console.log("🔐 Testing upload endpoint...");
  const response = await fetch('http://localhost:5000/api/videos/upload', {
    method: 'POST',
    headers: { 
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      title: 'Test Video',
      description: 'Test Description',
      category: 'entertainment'
    })
  });
  
  console.log(`Status: ${response.status}`);
  
  if (response.ok) {
    const data = await response.json();
    console.log("✅ Upload endpoint accessible!");
  } else {
    const error = await response.json();
    console.log("❌ Error:", error.message);
  }
}

testUpload().catch(console.error);
