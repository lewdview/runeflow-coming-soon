# Deployment Guide for RuneFlow and RuneRush

## Overview
This guide explains how to deploy both RuneFlow and RuneRush services separately on Railway and Netlify, ensuring a clear separation and consistent deployment process.

---

## RuneFlow Deployment
### Steps:
1. **Ensure that you have the necessary environment variables set** in `api/.env` and on the Railway dashboard for the RuneFlow service.
   - DATABASE_URL
   - NODE_ENV
   - PORT=8080
   
2. **Deploy using Railway**:
   - Navigate to the RuneFlow folder:
     ```bash
     cd api
     ```
   - Deploy the service:
     ```bash
     railway up
     ```

3. **Confirm Health**:
   - Make sure the API health check passes:
     ```
     http://[your-railway-url]/api/health
     ```

---

## RuneRush Deployment
### Steps:
1. **Ensure that you have the necessary environment variables set** in `runerush/.env` and on the Railway dashboard for the RuneRush service.
   - STRIPE_SECRET_KEY
   - SENDGRID_API_KEY
   - DATABASE_URL
   - NODE_ENV
   - PORT=8080

2. **Deploy using Railway**:
   - Navigate to the RuneRush folder:
     ```bash
     cd runerush
     ```
   - Deploy the service:
     ```bash
     railway up
     ```

3. **Confirm Health**:
   - Make sure the API health check passes:
     ```
     http://[your-railway-url]/api/health
     ```

---

## Netlify Setup
### Steps:
1. **Connect to your GitHub repository** in Netlify.
2. **Define Environmental Variables in the Netlify Dashboard:**
   - Set API URL redirects to point to the correct Railway services as per `netlify.toml`.
3. **Deploy the frontend with the build command**:
   ```bash
   npm run build
   ```

---

Ensure that all configurations and secrets are kept secure.

