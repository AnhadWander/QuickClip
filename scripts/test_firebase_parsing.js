const fs = require('fs');
const path = require('path');

function getServiceAccount(key) {
  if (!key) {
    console.warn("[Test] FIREBASE_SERVICE_ACCOUNT_KEY is missing.");
    return null;
  }
  
  try {
    const decoded = Buffer.from(key, "base64").toString("utf-8");
    console.log("[Test] Successfully decoded base64 key.");
    try {
      const parsed = JSON.parse(decoded);
      console.log(`[Test] Successfully parsed service account for project: ${parsed.project_id}`);
      return parsed;
    } catch (parseError) {
      console.error("[Test] JSON parse error: The decoded string is not valid JSON.");
      // Print first 50 chars of decoded string to debug
      console.log("[Test] Decoded start:", decoded.slice(0, 50));
      return null;
    }
  } catch (decodeError) {
    console.error("[Test] Failed to decode base64");
    return null;
  }
}

async function runTest() {
  const envPath = path.join(process.cwd(), '.env.local');
  const envContent = fs.readFileSync(envPath, 'utf8');
  
  // Extract FIREBASE_SERVICE_ACCOUNT_KEY using regex
  const match = envContent.match(/FIREBASE_SERVICE_ACCOUNT_KEY="?([^"\n]+)"?/);
  const key = match ? match[1] : null;
  
  if (!key) {
    console.error("FIREBASE_SERVICE_ACCOUNT_KEY not found in .env.local");
    process.exit(1);
  }
  
  console.log("Found key in .env.local (length:", key.length, ")");
  getServiceAccount(key);
}

runTest();
