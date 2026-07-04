const fs = require("fs");
const crypto = require("crypto");

const envContent = fs.readFileSync(".env.production", "utf8");
const lines = envContent.split("\n");
let secret = null;

for (const line of lines) {
  const trimmed = line.trim();
  if (trimmed.startsWith("CONTENTOPS_BRIDGE_SECRET=*** {
    const parts = trimmed.split("=");
    if (parts.length === 2) {
      secret = parts[1];
      break;
    }
  }
}

if (secret) {
  const hash = crypto.createHash("sha256").update(secret).digest("hex");
  console.log("serverBridgeSecretExists=true");
  console.log("serverBridgeSecretHashPrefix=" + hash.substring(0, 8));
  console.log("serverBridgeSecretLength=" + secret.length);
} else {
  console.log("serverBridgeSecretExists=false");
}
