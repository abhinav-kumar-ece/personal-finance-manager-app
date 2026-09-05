#!/bin/bash
# ==============================================================================
# Google Cloud Run + Gemini Hackathon Deployment Script
# Challenge: Cloud Run AI Challenge (dev-tutorial=cloud-run-ai-challenge)
# ==============================================================================

set -e

echo "🚀 Starting deployment to Google Cloud Run..."

# Set project configuration (replace with your GCP project ID or set via gcloud config)
PROJECT_ID=$(gcloud config get-value project)
REGION="us-central1"
SERVICE_NAME="personal-finance-manager"

if [ -z "$PROJECT_ID" ]; then
  echo "❌ No active GCP project set. Run: gcloud config set project <YOUR_PROJECT_ID>"
  exit 1
fi

echo "📦 Project ID: $PROJECT_ID | Region: $REGION | Service: $SERVICE_NAME"

# 1. Enable required Google Cloud APIs
echo "🔧 Enabling Cloud Run, Secret Manager, Firestore, and Cloud Build..."
gcloud services enable \
  run.googleapis.com \
  secretmanager.googleapis.com \
  firestore.googleapis.com \
  identitytoolkit.googleapis.com \
  cloudbuild.googleapis.com

# 2. Configure Secret Manager for GEMINI_API_KEY
if ! gcloud secrets describe GEMINI_API_KEY &>/dev/null; then
  echo "🔑 Creating secret GEMINI_API_KEY in Secret Manager..."
  read -sp "Enter your GEMINI_API_KEY: " GEMINI_KEY
  echo ""
  echo -n "$GEMINI_KEY" | gcloud secrets create GEMINI_API_KEY --data-file=-
else
  echo "✅ GEMINI_API_KEY secret already exists in Secret Manager."
fi

# 3. Grant Secret Manager Secret Accessor role to the default Compute service account
PROJECT_NUMBER=$(gcloud projects describe $PROJECT_ID --format='value(projectNumber)')
SERVICE_ACCOUNT="${PROJECT_NUMBER}-compute@developer.gserviceaccount.com"

echo "🔐 Granting Secret Manager Accessor role to $SERVICE_ACCOUNT..."
gcloud secrets add-iam-policy-binding GEMINI_API_KEY \
  --member="serviceAccount:${SERVICE_ACCOUNT}" \
  --role="roles/secretmanager.secretAccessor" || true

# 4. Deploy containerized service to Google Cloud Run
# REQUIRED HACKATHON LABEL: dev-tutorial=cloud-run-ai-challenge
echo "🚀 Deploying to Cloud Run with required hackathon label: dev-tutorial=cloud-run-ai-challenge..."
gcloud run deploy "$SERVICE_NAME" \
  --source . \
  --region "$REGION" \
  --allow-unauthenticated \
  --set-secrets="GEMINI_API_KEY=GEMINI_API_KEY:latest" \
  --labels="dev-tutorial=cloud-run-ai-challenge" \
  --memory="512Mi" \
  --cpu="1"

echo "🎉 Deployment successfully completed!"
echo "Visit your live Cloud Run URL above to test: Login → Per-User Data Isolation → Multi-Turn Finance Assistant Chat!"
