<p align="center">
  <img src="https://github.com/VisilyRomani/enlive-manager/assets/36494994/e957193b-0893-4243-825d-31edbff0f7c2" width="350" title="hover text">
</p>

## About

Welcome to my CRM system built to optimize job and client management along with hassle-free invoicing. This platform offers seamless job tracking, empowering you to oversee projects from start to finish, centralize client information and create simple scheudles. It also includes an automated invoicing feature that simplifies the billing process, allowing you to generate and dispatch invoices effortlessly.

# Technologies

- Prisma
- Postgresql
- React
- Nextjs
- TRPC
- Cloudflare R2

## Quick Start

To get it running, follow the steps below:

### Setup dependencies

#### .env files

- apps/nextjs/.env
  - GOOGLE_CLIENT_ID
  - GOOGLE_CLIENT_SECRET
  - NEXTAUTH_SECRET
  - CLOUDFLARE_PUBLIC
- packages/db/.env
  - LOCAL_DATABASE
  - DIRECT_DEV_DATABASE
  - CLOUDFLARE_ACCESS
  - CLOUDFLARE_SECRET
  - CLOUDFLARE_ADDRESS
  - CLOUDFLARE_PUBLIC
  - RESEND_API
  - EMAIL_STRING (EX. "Company Name <noreply@domain.com>") 

```diff
# Install dependencies
pnpm i

# Make sure you have your env files setup and make sure prisma is synced
pnpm db-push


# Launch
Navigate to: packages/db && apps/nextjs
pnpm dev
```
