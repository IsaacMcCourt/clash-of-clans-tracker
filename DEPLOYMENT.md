# Deployment Guide

This guide explains how to deploy the Clash of Clans Upgrade Tracker to an Amazon S3 bucket for static hosting.

## Prerequisites

1. An AWS account
2. AWS CLI installed and configured with proper credentials
3. A build of the application (`npm run build`)

## Steps to Deploy

### 1. Create an S3 Bucket

First, create an S3 bucket through the AWS Management Console or using the AWS CLI:

```bash
aws s3 mb s3://your-bucket-name --region your-region
```

Replace `your-bucket-name` with a unique bucket name and `your-region` with your AWS region.

### 2. Configure the Bucket for Static Website Hosting

```bash
aws s3 website s3://your-bucket-name --index-document index.html --error-document index.html
```

### 3. Set the Bucket Policy to Allow Public Access

Create a file named `bucket-policy.json` with the following content:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::your-bucket-name/*"
    }
  ]
}
```

Apply the policy:

```bash
aws s3api put-bucket-policy --bucket your-bucket-name --policy file://bucket-policy.json
```

### 4. Build the Application

```bash
npm run build
```

This will create a `dist` directory with the built application.

### 5. Upload the Build to S3

```bash
aws s3 sync dist/ s3://your-bucket-name --delete
```

### 6. Access Your Website

Your website will be available at:

```
http://your-bucket-name.s3-website-your-region.amazonaws.com/
```

Or if using a custom domain, follow the AWS documentation to set up Route 53 and CloudFront.

## Automating Deployment

To automate the deployment process, you can create a script:

```bash
#!/bin/bash
# deploy.sh

BUCKET_NAME="your-bucket-name"
REGION="your-region"

# Build the application
echo "Building the application..."
npm run build

# Upload to S3
echo "Deploying to S3..."
aws s3 sync dist/ s3://$BUCKET_NAME --delete

echo "Deployment complete!"
echo "Website URL: http://$BUCKET_NAME.s3-website-$REGION.amazonaws.com/"
```

Make the script executable:

```bash
chmod +x deploy.sh
```

Then run it:

```bash
./deploy.sh
```

## GitHub Actions Workflow (Optional)

You can also set up a GitHub Actions workflow to automatically deploy the app to S3 when you push to the main branch. Create a file `.github/workflows/deploy.yml` with the following content:

```yaml
name: Deploy to S3

on:
  push:
    branches:
      - main

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Set up Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Build
        run: npm run build
        
      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v2
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: ${{ secrets.AWS_REGION }}
          
      - name: Deploy to S3
        run: aws s3 sync dist/ s3://${{ secrets.AWS_S3_BUCKET }} --delete
```

Remember to add your AWS credentials as secrets in your GitHub repository.