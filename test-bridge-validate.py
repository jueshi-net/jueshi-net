import json
import hmac
import hashlib
import requests

# 读取 secret
with open(".env.local") as f:
    for line in f:
        line = line.strip()
        if line.startswith("CONTENTOPS_BRIDGE_SECRET=*** {
            parts = line.split("=", 1)
            if len(parts) == 2:
                secret = parts[1]
                break
    else:
        print("bridgeValidateOnlyPass=false")
        print("bridgeValidateOnlyErrorType=missing_secret")
        exit(1)

# 构造请求体
payload = {
    "contentType": "topic",
    "title": "Test Topic",
    "gatewayLocation": "local_mac",
    "localHermesRunId": "test-run-001",
    "planningUsed": True,
    "fallbackUsed": False,
    "validateOnly": True
}

body = json.dumps(payload)

# 生成 HMAC 签名
signature = hmac.new(secret.encode(), body.encode(), hashlib.sha256).hexdigest()

# 发送请求
try:
    response = requests.post(
        "https://jueshi.net/api/internal/contentops/drafts",
        headers={
            "Content-Type": "application/json",
            "x-contentops-signature": signature
        },
        data=body,
        timeout=10
    )
    
    if response.status_code == 200:
        data = response.json()
        if data.get("success"):
            print("bridgeValidateOnlyPass=true")
            print("hmacPass=true")
            print("schemaPass=true")
            print("bridgeValidateOnlyStatus=success")
            print("bridgeValidateOnlyErrorType=none")
        else:
            print("bridgeValidateOnlyPass=false")
            print("hmacPass=true")
            print("schemaPass=false")
            print("bridgeValidateOnlyStatus=schema_validation_failed")
            print("bridgeValidateOnlyErrorType=schema_validation_failed")
    elif response.status_code == 401:
        print("bridgeValidateOnlyPass=false")
        print("hmacPass=false")
        print("schemaPass=false")
        print("bridgeValidateOnlyStatus=invalid_signature")
        print("bridgeValidateOnlyErrorType=invalid_signature_format")
    else:
        print("bridgeValidateOnlyPass=false")
        print("hmacPass=unknown")
        print("schemaPass=unknown")
        print("bridgeValidateOnlyStatus=route_error")
        print("bridgeValidateOnlyErrorType=route_error")
        print("statusCode=" + str(response.status_code))
except Exception as e:
    print("bridgeValidateOnlyPass=false")
    print("bridgeValidateOnlyErrorType=route_error")
    print("error=" + str(e))
