#!/bin/bash
# deploy.sh

# Configuration - replace these values with your own
BUCKET_NAME="clash-of-clans-tracker"
REGION="us-east-1"

# Build the application
echo "Building the application..."
npm run build

# Upload to S3
echo "Deploying to S3..."
aws s3 sync dist/ s3://$BUCKET_NAME --delete

echo "Deployment complete!"
echo "Website URL: http://$BUCKET_NAME.s3-website-$REGION.amazonaws.com/"