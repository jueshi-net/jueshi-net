const fs = require("fs");
const crypto = require("crypto");
const https = require("https");

// 读取 secret
const envContent = fs.readFileSync(".env.local", "utf8");
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

if (!secret) {
  console.log("bridgeValidateOnlyPass=false");
  console.log("bridgeValidateOnlyErrorType=missing_secret");
  process.exit(1);
}

// 构造请求体
const payload = {
  contentType: "topic",
  title: "Test Topic",
  gatewayLocation: "local_mac",
  localHermesRunId: "test-run-" + Date.now(),
  planningUsed: true,
  fallbackUsed: false,
  validateOnly: true
};

const body = JSON.stringify(payload);

// 生成 HMAC 签名
const signature = crypto.createHmac("sha256", secret).update(body).digest("hex");

// 发送请求
const options = {
  hostname: "jueshi.net",
  port: 443,
  path: "/api/internal/contentops/drafts",
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "x-contentops-signature": signature,
    "Content-Length": Buffer.byteLength(body)
  }
};

const req = https.request(options, (res) => {
  let data = "";
  res.on("data", (chunk) => { data += chunk; });
  res.on("end", () => {
    if (res.statusCode === 200) {
      const response = JSON.parse(data);
      if (response.success) {
        console.log("bridgeValidateOnlyPass=true");
        console.log("hmacPass=true");
        console.log("schemaPass=true");
        console.log("bridgeValidateOnlyStatus=success");
        console.log("bridgeValidateOnlyErrorType=none");
      } else {
        console.log("bridgeValidateOnlyPass=false");
        console.log("hmacPass=true");
        console.log("schemaPass=false");
        console.log("bridgeValidateOnlyStatus=schema_validation_failed");
        console.log("bridgeValidateOnlyErrorType=schema_validation_failed");
      }
    } else if (res.statusCode === 401) {
      console.log("bridgeValidateOnlyPass=false");
      console.log("hmacPass=false");
      console.log("schemaPass=false");
      console.log("bridgeValidateOnlyStatus=invalid_signature");
      console.log("bridgeValidateOnlyErrorType=invalid_signature_format");
    } else {
      console.log("bridgeValidateOnlyPass=false");
      console.log("hmacPass=unknown");
      console.log("schemaPass=unknown");
      console.log("bridgeValidateOnlyStatus=route_error");
      console.log("bridgeValidateOnlyErrorType=route_error");
      console.log("statusCode=" + res.statusCode);
    }
  });
});

req.on("error", (e) => {
  console.log("bridgeValidateOnlyPass=false");
  console.log("bridgeValidateOnlyErrorType=route_error");
  console.log("error=" + e.message);
});

req.write(body);
req.end();
