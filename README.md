# ResolveX — Autonomous Customer Resolution Agent

ResolveX is an autonomous customer resolution system designed to handle complex support workflows deterministically, safely, and adaptively.

## Architecture

$$\text{GOAL} \rightarrow \text{UNDERSTAND} \rightarrow \text{INVESTIGATE} \rightarrow \text{POLICY CHECK} \rightarrow \text{DECIDE} \rightarrow \text{ACTION} \rightarrow \text{RESULT} \rightarrow \text{VERIFY} \rightarrow \text{REPLAN} \rightarrow \text{RESOLVE}$$

## Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Database Migration & Seed
```bash
npx prisma db push
npm run db:seed
```

### 3. Run Tests
```bash
npm test
```

### 4. Run Development Servers
```bash
npm run dev
```

- **Backend API**: `http://localhost:5000/api/v1/health`
- **Frontend Dashboard**: `http://localhost:3000`
