#!/bin/bash

# Unusual Clone Deployment Script
# This script deploys the edge function and client script to Supabase

set -e  # Exit immediately if a command exits with a non-zero status

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Supabase project reference
PROJECT_REF="gckvjovozupvteqivjiv"

echo -e "${YELLOW}Starting Unusual Clone deployment...${NC}"

# Check if Supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo -e "${RED}Error: Supabase CLI is not installed.${NC}"
    echo "Please install it with: npm install -g supabase"
    exit 1
fi

# Verify login status to Supabase
echo -e "${YELLOW}Checking Supabase login status...${NC}"
if ! supabase projects list &> /dev/null; then
    echo -e "${YELLOW}Please login to Supabase:${NC}"
    supabase login
fi

# Deploy Edge Function
echo -e "${YELLOW}Deploying Edge Function...${NC}"
cd "$(dirname "$0")/../supabase/functions"
supabase functions deploy get_content --project-ref $PROJECT_REF

# Check deployment status
if [ $? -eq 0 ]; then
    echo -e "${GREEN}Edge Function deployed successfully!${NC}"
else
    echo -e "${RED}Edge Function deployment failed.${NC}"
    exit 1
fi

# Upload client script to Supabase Storage
echo -e "${YELLOW}Uploading client script to Storage...${NC}"
cd "$(dirname "$0")/.."

# Check if the 'scripts' bucket exists, create if not
BUCKET_EXISTS=$(supabase storage list-buckets --project-ref $PROJECT_REF | grep -c "scripts" || true)
if [ "$BUCKET_EXISTS" -eq "0" ]; then
    echo -e "${YELLOW}Creating 'scripts' bucket...${NC}"
    supabase storage create-bucket scripts --public --project-ref $PROJECT_REF
fi

# Upload the unusual.js script
echo -e "${YELLOW}Uploading unusual.js...${NC}"
supabase storage upload scripts unusual-clone/scripts/unusual.js --project-ref $PROJECT_REF

# Check upload status
if [ $? -eq 0 ]; then
    echo -e "${GREEN}Client script uploaded successfully!${NC}"
else
    echo -e "${RED}Client script upload failed.${NC}"
    exit 1
fi

# Get the public URL of the script
SCRIPT_URL=$(supabase storage get-public-url scripts/unusual.js --project-ref $PROJECT_REF)
echo -e "${GREEN}Client script is now available at:${NC}"
echo -e "${YELLOW}$SCRIPT_URL?user_id=YOUR_USER_ID${NC}"

# Test the edge function
echo -e "${YELLOW}Testing the edge function...${NC}"
RESPONSE=$(curl -s -X POST https://$PROJECT_REF.supabase.co/functions/v1/get_content \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdja3Zqb3ZvenVwdnRlcWl2aml2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI4MzEyODcsImV4cCI6MjA1ODQwNzI4N30.jKqHs21xpUtAcooiAOL-e04fkYEGVqEdpdSfB7PLnrs" \
  -d '{"user_id":"94ea550b-0f42-4266-81a6-94888a1eb91a", "referrer":"", "url":"https://example.com"}')

if [[ $RESPONSE == *"success"* ]]; then
    echo -e "${GREEN}Edge function test successful!${NC}"
else
    echo -e "${YELLOW}Edge function test returned:${NC}"
    echo $RESPONSE
fi

echo ""
echo -e "${GREEN}Deployment completed successfully!${NC}"
echo -e "${YELLOW}To use the script on your website, add this to your HTML:${NC}"
echo ""
echo "<script src=\"$SCRIPT_URL?user_id=YOUR_USER_ID\"></script>"
echo ""
echo -e "${YELLOW}Make sure to replace YOUR_USER_ID with the actual user ID.${NC}" 