// Run this in the browser console on any page
console.log("🔧 Fixing authentication...");

// Clear invalid auth data
localStorage.removeItem('lumina_token');
localStorage.removeItem('lumina_user');

console.log("✅ Cleared stale auth data");
console.log("🔄 Please refresh the page and log in again");

// Redirect to login after 1 second
setTimeout(() => {
  window.location.href = '/login';
}, 1000);
