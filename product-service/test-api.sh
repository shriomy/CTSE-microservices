#!/bin/bash

# Product Service API Testing Script
# This script provides useful curl commands for testing the Product Service API

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
BASE_URL="http://localhost:8083"
AUTH_SERVICE_URL="http://localhost:8081"
ADMIN_EMAIL="admin@example.com"
ADMIN_PASSWORD="admin123"
USER_EMAIL="user@example.com"
USER_PASSWORD="user123"

# Variables to store tokens
ADMIN_TOKEN=""
USER_TOKEN=""

echo -e "${YELLOW}=== Product Service API Testing ===${NC}\n"

# Function to get auth token
get_token() {
    local email=$1
    local password=$2
    local role=$3
    
    echo -e "${YELLOW}Getting $role token...${NC}"
    
    # First register if needed
    curl -s -X POST "$AUTH_SERVICE_URL/api/auth/register" \
        -H "Content-Type: application/json" \
        -d "{\"name\":\"$role User\",\"email\":\"$email\",\"password\":\"$password\",\"role\":\"ROLE_$role\"}" \
        > /dev/null 2>&1
    
    # Login and get token
    response=$(curl -s -X POST "$AUTH_SERVICE_URL/api/auth/login" \
        -H "Content-Type: application/json" \
        -d "{\"email\":\"$email\",\"password\":\"$password\"}")
    
    token=$(echo $response | grep -o '"token":"[^"]*' | cut -d'"' -f4)
    
    if [ -z "$token" ]; then
        echo -e "${RED}Failed to get token${NC}"
        return 1
    fi
    
    echo -e "${GREEN}Token obtained successfully${NC}\n"
    echo "$token"
}

# Function to make authenticated request
make_request() {
    local method=$1
    local endpoint=$2
    local token=$3
    local data=$4
    
    if [ -z "$token" ]; then
        # Public request
        curl -s -X $method "$BASE_URL$endpoint" \
            -H "Content-Type: application/json"
    else
        # Authenticated request
        curl -s -X $method "$BASE_URL$endpoint" \
            -H "Authorization: Bearer $token" \
            -H "Content-Type: application/json" \
            -d "$data"
    fi
}

echo "======================================"
echo "1. Authentication Setup"
echo "======================================"

ADMIN_TOKEN=$(get_token "$ADMIN_EMAIL" "$ADMIN_PASSWORD" "ADMIN")
USER_TOKEN=$(get_token "$USER_EMAIL" "$USER_PASSWORD" "USER")

echo ""
echo "======================================"
echo "2. Admin: Create Products"
echo "======================================"

echo -e "${YELLOW}Creating Product 1: Ballpoint Pen${NC}"
response=$(make_request "POST" "/api/products" "$ADMIN_TOKEN" \
    '{
        "name": "Ballpoint Pen Blue",
        "description": "Smooth writing ballpoint pen with premium ink",
        "price": 29.99,
        "imageUrl": "https://example.com/pen-blue.jpg",
        "availability": true
    }')
echo "$response" | jq .
PRODUCT_1_ID=$(echo "$response" | jq -r '.id')

echo ""
echo -e "${YELLOW}Creating Product 2: Notebook${NC}"
response=$(make_request "POST" "/api/products" "$ADMIN_TOKEN" \
    '{
        "name": "Notebook A4",
        "description": "Premium quality spiral notebook with 200 pages",
        "price": 299.99,
        "imageUrl": "https://example.com/notebook-a4.jpg",
        "availability": true
    }')
echo "$response" | jq .
PRODUCT_2_ID=$(echo "$response" | jq -r '.id')

echo ""
echo "======================================"
echo "3. Public: Get All Products"
echo "======================================"

echo -e "${YELLOW}Fetching all products (public access)${NC}"
make_request "GET" "/api/products" "" | jq .

echo ""
echo "======================================"
echo "4. Public: Get Available Products"
echo "======================================"

echo -e "${YELLOW}Fetching available products${NC}"
make_request "GET" "/api/products/available" "" | jq .

echo ""
echo "======================================"
echo "5. Public: Get Product by ID"
echo "======================================"

if [ ! -z "$PRODUCT_1_ID" ]; then
    echo -e "${YELLOW}Fetching Product $PRODUCT_1_ID${NC}"
    make_request "GET" "/api/products/$PRODUCT_1_ID" "" | jq .
fi

echo ""
echo "======================================"
echo "6. Public: Search Product by Name"
echo "======================================"

echo -e "${YELLOW}Searching for 'Ballpoint'${NC}"
make_request "GET" "/api/products/search/Ballpoint%20Pen%20Blue" "" | jq .

echo ""
echo "======================================"
echo "7. Admin: Update Product"
echo "======================================"

if [ ! -z "$PRODUCT_1_ID" ]; then
    echo -e "${YELLOW}Updating Product $PRODUCT_1_ID${NC}"
    make_request "PUT" "/api/products/$PRODUCT_1_ID" "$ADMIN_TOKEN" \
        '{
            "price": 39.99,
            "description": "Updated: Premium ballpoint pen with ultra-smooth ink"
        }' | jq .
fi

echo ""
echo "======================================"
echo "8. Authorization Test: User Tries Admin Action"
echo "======================================"

echo -e "${YELLOW}User attempting to create product (should fail with 403)${NC}"
make_request "POST" "/api/products" "$USER_TOKEN" \
    '{
        "name": "Unauthorized Product",
        "description": "This should fail",
        "price": 99.99,
        "imageUrl": "https://example.com/invalid.jpg",
        "availability": true
    }' | jq .

echo ""
echo "======================================"
echo "9. Admin: Delete Product"
echo "======================================"

if [ ! -z "$PRODUCT_2_ID" ]; then
    echo -e "${YELLOW}Deleting Product $PRODUCT_2_ID${NC}"
    make_request "DELETE" "/api/products/$PRODUCT_2_ID" "$ADMIN_TOKEN" ""
    echo -e "${GREEN}Product deleted (204 No Content)${NC}"
fi

echo ""
echo "======================================"
echo "10. Verify Final Product State"
echo "======================================"

echo -e "${YELLOW}Fetching all remaining products${NC}"
make_request "GET" "/api/products" "" | jq .

echo ""
echo -e "${GREEN}=== Testing Complete ===${NC}"
