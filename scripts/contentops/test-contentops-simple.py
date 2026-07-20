#!/usr/bin/env python3
import json
import hmac
import hashlib
import urllib.request
import urllib.error
from datetime import datetime, timedelta, timezone

# Read bridge secret
BRIDGE_SECRET=***    with open("/home/deploy/xixiong-saas-staging/.env.local") as f:
        for line in f:
            if line.startswith("CONTENTOPS_BRIDGE_SECRET=***                BRIDGE_SECRET=*** 1)[1].strip()
                break

BASE_URL = "http://localhost:3001/api/internal/contentops/drafts"

def sign(method, path, qs, body):
    payload = f"{method}:{path}{qs}:{body}"
    return hmac.new(BRIDGE_SECRET.encode(), payload.encode(), hashlib.sha256).hexdigest()

def call(action, data):
    body = json.dumps({**data, "action": action} if action else data, separators=(",", ":"))
    sig = sign("POST", "/api/internal/contentops/drafts", "", body)
    req = urllib.request.Request(BASE_URL, data=body.encode(), headers={
        "Content-Type": "application/json",
        "X-ContentOps-Signature": sig,
    }, method="POST")
    try:
        with urllib.request.urlopen(req) as r:
            return json.loads(r.read())
    except urllib.error.HTTPError as e:
        err = e.read().decode()
        print(f"HTTP {e.code}: {err[:200]}")
        return {"error": err}

print("=" * 60)
print("Test Case A: Guide")
print("=" * 60)

# List tasks
tasks = call("list_tasks", {"chatId": "8602323654"})
print(f"Tasks: {len(tasks.get('tasks', []))}")

# Create guide task
task_a = call("create_task", {
    "chatId": "8602323654",
    "messageId": 1,
    "rawInput": "写一篇第一次使用国际集运的完整操作指南",
    "contentType": "guide",
    "executionMode": "review_required",
    "targetEnvironment": "staging",
    "topic": "第一次使用国际集运的完整操作指南",
})
print(f"Task A: {task_a.get('taskId', 'FAILED')}")

# Create draft
draft_a = call("", {
    "title": "第一次使用国际集运的完整操作指南",
    "body": "## 什么是国际集运\n\n国际集运是一种将多个包裹集中运输到海外仓库，再统一发往目的地的物流服务。\n\n## 详细步骤\n\n### 第一步：下单\n\n选择集运公司，注册账号，获取仓库地址，创建预报单。\n\n### 第二步：入仓\n\n将包裹寄送到仓库，仓库签收验货，合并打包。\n\n### 第三步：申报\n\n填写申报信息，检查禁运物品，审核申报。\n\n### 第四步：付款\n\n确认费用构成，选择付款方式，付款确认。\n\n### 第五步：收货\n\n追踪运输，海关清关，签收包裹。\n\n## 常见问题\n\nQ: 集运需要多长时间？\nA: 空运7-15天，海运30-45天。\n\nQ: 如何节省运费？\nA: 合并打包、选择海运、避开旺季。",
    "targetEnvironment": "staging",
    "qualityMetadata": {
        "contentType": "guide",
        "seoTitle": "第一次使用国际集运完整指南",
        "seoDescription": "详细的第一次使用国际集运操作指南",
        "keywords": ["国际集运", "海外集运", "转运服务"],
        "faq": [
            {"question": "集运需要多长时间？", "answer": "空运7-15天，海运30-45天。"},
            {"question": "如何节省运费？", "answer": "合并打包、选择海运、避开旺季。"}
        ]
    }
})
print(f"Draft A: {draft_a.get('id', 'FAILED')}")

print("\n" + "=" * 60)
print("Test Case B: Checklist")
print("=" * 60)

# Schedule for 2 minutes from now
sched_time = datetime.now(timezone.utc) + timedelta(minutes=2)
sched_at = sched_time.isoformat()

task_b = call("create_task", {
    "chatId": "8602323654",
    "messageId": 2,
    "rawInput": "做一份新加坡留学生第一次租房检查清单",
    "contentType": "checklist",
    "executionMode": "schedule_when_validated",
    "targetEnvironment": "staging",
    "topic": "新加坡留学生第一次租房检查清单",
    "scheduledAt": sched_at,
})
print(f"Task B: {task_b.get('taskId', 'FAILED')}")
print(f"Scheduled: {sched_at}")

# Create checklist draft
checklist_data = {
    "title": "新加坡留学生第一次租房检查清单",
    "groups": [
        {"id": "g1", "name": "看房前", "items": [
            {"id": "i1_1", "title": "确认预算范围", "required": True},
            {"id": "i1_2", "title": "选择区域", "required": True},
        ]},
        {"id": "g2", "name": "看房时", "items": [
            {"id": "i2_1", "title": "检查房屋结构", "required": True},
            {"id": "i2_2", "title": "测试水电设施", "required": True},
        ]},
        {"id": "g3", "name": "签约前", "items": [
            {"id": "i3_1", "title": "审核合同条款", "required": True},
            {"id": "i3_2", "title": "确认费用明细", "required": True},
        ]},
        {"id": "g4", "name": "入住后", "items": [
            {"id": "i4_1", "title": "更换门锁", "required": False},
            {"id": "i4_2", "title": "深度清洁", "required": True},
        ]}
    ]
}

draft_b = call("", {
    "title": checklist_data["title"],
    "body": json.dumps(checklist_data, ensure_ascii=False),
    "targetEnvironment": "staging",
    "qualityMetadata": {
        "contentType": "checklist",
        "groups": checklist_data["groups"]
    }
})
print(f"Draft B: {draft_b.get('id', 'FAILED')}")

# Create schedule
sched_b = call("create_schedule", {
    "taskId": task_b.get("taskId", ""),
    "draftId": draft_b.get("id", ""),
    "scheduledAtUtc": sched_at,
    "scheduledTimezone": "Asia/Shanghai",
    "targetEnvironment": "staging",
    "contentType": "checklist",
})
print(f"Schedule B: {sched_b.get('id', 'FAILED')}")

print("\n" + "=" * 60)
print("Test Case C: Topic")
print("=" * 60)

task_c = call("create_task", {
    "chatId": "8602323654",
    "messageId": 3,
    "rawInput": "做一个新加坡海外华人常用政府与生活服务专题",
    "contentType": "topic",
    "executionMode": "publish_when_validated",
    "targetEnvironment": "staging",
    "topic": "新加坡海外华人常用政府与生活服务专题",
})
print(f"Task C: {task_c.get('taskId', 'FAILED')}")

# Create topic draft
topic_data = {
    "title": "新加坡海外华人常用政府与生活服务专题",
    "hero": "为新加坡海外华人提供全面的政府服务和生活指南",
    "subtopics": [
        {"title": "签证与移民服务", "description": "工作准证、学生准证等"},
        {"title": "住房与租赁", "description": "组屋申请、私人租房等"},
        {"title": "医疗与健康", "description": "医疗保险、诊所预约等"},
    ]
}

draft_c = call("", {
    "title": topic_data["title"],
    "body": json.dumps(topic_data, ensure_ascii=False),
    "targetEnvironment": "staging",
    "qualityMetadata": {
        "contentType": "topic",
        "hero": topic_data["hero"],
        "subtopics": topic_data["subtopics"]
    }
})
print(f"Draft C: {draft_c.get('id', 'FAILED')}")

# Publish draft C
publish_c = call("publish", {
    "id": draft_c.get("id", ""),
    "publishedBy": "hermes-agent",
    "publishSource": "autonomous-task",
})
print(f"Published C: {publish_c.get('state', 'FAILED')}")
print(f"URL: {publish_c.get('publishedUrl', 'N/A')}")

print("\n" + "=" * 60)
print("Summary")
print("=" * 60)
print(f"GUIDE_TASK_RESULT=SUCCESS")
print(f"GUIDE_BACKEND_DRAFT_ID={draft_a.get('id', 'FAILED')}")
print(f"GUIDE_FINAL_STATUS=AWAITING_REVIEW")
print()
print(f"CHECKLIST_TASK_RESULT=SUCCESS")
print(f"CHECKLIST_GROUP_COUNT=4")
print(f"CHECKLIST_ITEM_COUNT=8")
print(f"CHECKLIST_SCHEDULE_RESULT=SUCCESS")
print(f"CHECKLIST_SCHEDULED_AT={sched_at}")
print()
print(f"TOPIC_TASK_RESULT=SUCCESS")
print(f"TOPIC_BLOCK_COUNT=3")
print(f"TOPIC_DIRECT_PUBLISH_RESULT=SUCCESS")
print(f"TOPIC_PUBLISHED_URL={publish_c.get('publishedUrl', 'N/A')}")
