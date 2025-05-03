#!/bin/bash

# Set your test user ID and account ID
USER_ID="test_user_123"
ACCOUNT_ID="your_account_id"
REQUISITION_ID="your_requisition_id"

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo "Testing Referlut API endpoints..."
echo "--------------------------------"

# Test root endpoint
echo -e "\n${GREEN}Testing root endpoint:${NC}"
curl -s http://localhost:8000/
echo -e "\n"

# Test bank linking initiation
echo -e "${GREEN}Testing bank linking initiation:${NC}"
curl -s -X POST "http://localhost:8000/bank/link/initiate?user_id=$USER_ID&institution_id=REVOLUT_REVOLUT&redirect_url=http://localhost:3000/callback"
echo -e "\n"

# Test bank link callback
echo -e "${GREEN}Testing bank link callback:${NC}"
curl -s -X POST http://localhost:8000/bank/link/callback \
  -H "Content-Type: application/json" \
  -d "{
    \"user_id\": \"$USER_ID\",
    \"requisition_id\": \"$REQUISITION_ID\"
  }"
echo -e "\n"

# Test getting accounts
echo -e "${GREEN}Testing get accounts:${NC}"
curl -s "http://localhost:8000/accounts?user_id=$USER_ID"
echo -e "\n"

# Test getting transactions
echo -e "${GREEN}Testing get transactions:${NC}"
curl -s "http://localhost:8000/transactions?account_id=$ACCOUNT_ID&months=12"
echo -e "\n"

# Test getting statistics
echo -e "${GREEN}Testing get statistics:${NC}"
curl -s "http://localhost:8000/statistics?user_id=$USER_ID"
echo -e "\n"

# Test getting AI insights
echo -e "${GREEN}Testing get AI insights:${NC}"
curl -s -X POST http://localhost:8000/ai/insights \
  -H "Content-Type: application/json" \
  -d "{
    \"user_id\": \"$USER_ID\"
  }"
echo -e "\n" 