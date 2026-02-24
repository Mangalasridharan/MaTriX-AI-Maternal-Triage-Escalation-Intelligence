# 🚀 MaTriX-AI Deployment Guide

This guide explains how to deploy the full MaTriX-AI stack to the cloud for production/demo use.

## 1. Prerequisites

- A **GitHub** account with this repository pushed.
- A **HuggingFace** token with access to MedGemma.
- **AWS** Credentials for SageMaker access.
- A **Supabase** or **Neon.tech** account for PostgreSQL + pgvector.

---

## 2. Database (Storage + Vector Search)

We recommend **Supabase** because it includes `pgvector` by default.

1. Create a project on [Supabase.com](https://supabase.com).
2. Go to **Project Settings > Database** and copy the **Connection String** (URI).
3. Ensure you append `?sslmode=require` to the end of the connection string.
4. **Important**: You will need two databases (or two schemas) if you want to keep the Cloud and Edge databases separate, or just use the same one for the demo.

---

## 3. Backends (Render.com)

[Render](https://render.com) is the easiest platform to deploy Dockerized FastAPI apps. We have included a `render.yaml` Blueprint to make this a 1-click deployment!

1. Go to your Render Dashboard and click **New** -> **Blueprint**.
2. Connect your GitHub repository.
3. Render will automatically read `render.yaml` and deploy BOTH the **Cloud Gateway** and **Edge Node** simultaneously.
4. It will securely auto-generate internal secrets (like `CLOUD_API_KEY` and `JWT_SECRET_KEY`) and link the Edge node to the Cloud node so you don't have to manually.
5. **Action Required**: You must paste your **Supabase Database URL** when prompted during the Blueprint setup.

If you prefer deploying manually as Web Services, refer to `.env.example` in the root for all required environment variables.

---

## 4. Frontend (Vercel)

Vercel is the gold standard for Next.js. The repository includes a `vercel.json` config in the `frontend/` directory that hardens security headers and optimizations automatically.

1. Go to [Vercel.com](https://vercel.com) and import your project.
2. Set **Root Directory** to `frontend`.
3. Vercel will auto-detect Next.js settings and read the `vercel.json` file.
4. **Add Environment Variables**:
   - `NEXT_PUBLIC_API_URL`: [The URL Render gave you for the **Edge Node**]
5. Deploy!

---

## 5. Configuration Sync

Once deployed, make sure the following cross-connections are correct:

| Service           | Setting               | Value                               |
| ----------------- | --------------------- | ----------------------------------- |
| **Frontend**      | `NEXT_PUBLIC_API_URL` | Edge Node URL (Render)              |
| **Edge Node**     | `CLOUD_API_URL`       | Cloud Gateway URL (Render)          |
| **Cloud Gateway** | `SAGEMAKER_ROLE_ARN`  | IAM Role with SageMaker permissions |

---

## 🛡️ Security Note

Ensure your `CLOUD_API_KEY` is long and unique. This key prevents unauthorized access to your SageMaker endpoints through the cloud gateway.
