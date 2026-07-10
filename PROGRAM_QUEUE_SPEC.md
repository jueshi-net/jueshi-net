# Program Queue Spec

## Current Task
Task: PROGRAM_MANAGER_V4_BOOTSTRAP_LOCK

## Task Priority
P0: Bootstrap System
P1: SSH Check Script
P2: Deploy Guard
P3: Memory Lock
P4: 429 Recovery
P5: Checkpoint System
P6: Report Quality

## Task Requirements
1. Create project-bootstrap.sh
2. Create scripts/check-staging.sh
3. Modify deploy-staging.sh to call check-staging.sh
4. Create memory-lock.sh
5. Implement 429 recovery logic in conversation_loop
6. Implement real-time checkpoint system
7. Ensure no "请用户检查 SSH" in reports

## Task Status
In Progress: P0-P3 completed, P4-P6 in progress
