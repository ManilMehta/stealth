## Objective

Demonstrate the end-to-end genomic risk screening experience without requiring production-grade genomics infrastructure for free. I want to spend nothing on this deliverable. 

The purpose of Phase 0 is to validate:

* Investor interest
* User demand
* Product UX
* Risk report presentation

This phase is not intended for real customer use.

---

# Scope

## Included

### User Authentication

* Login
* Registration

### File Upload

Accept:

* Mock 23andMe file
* Synthetic genotype file

### Single Disease Model

Initial disease:

Coronary Artery Disease (CAD)

Reason:

* Strong PRS literature
* Easy to explain
* Large addressable market

### Risk Calculation

Use a simplified PRS model:

* 20-50 SNPs
* Static SNP weights
* Deterministic scoring

### Risk Categories

Low

Average

Elevated

High

### Dashboard

Display:

* Risk percentile
* Risk category
* Population comparison

### AI Explanation

Generate:

* Plain language summary
* Educational interpretation
* Lifestyle guidance disclaimer

### PDF Report

Single downloadable report.

---

# Excluded

* Multiple diseases
* Real ancestry calibration
* Full PRS catalog integration
* Family history integration
* Payment processing
* Clinical workflows
* Laboratory testing

---

# Demo Dataset

Create 3 synthetic genomic profiles.

## User A

Low Risk

Expected Output:

CAD Percentile: 15

Category: Low Risk

---

## User B

Average Risk

Expected Output:

CAD Percentile: 55

Category: Average Risk

---

## User C

High Risk

Expected Output:

CAD Percentile: 97

Category: High Risk

---

# Demo Workflow

User Login
|
Upload DNA File
|
Genotype Parser
|
CAD PRS Engine
|
Risk Categorization
|
Dashboard
|
AI Explanation
|
PDF Report

---

# Engineering Deliverables

Frontend

* Next.js dashboard
* Upload page
* Results page

Backend

* FastAPI API
* PRS scoring endpoint
* Report generation endpoint

Database

* PostgreSQL

Storage

* AWS S3

AI

* LLM-generated report summaries

---

# Success Criteria

A user can:

1. Upload a DNA file.
2. Receive a CAD risk score.
3. View percentile ranking.
4. Receive AI explanation.
5. Download PDF report.

Total processing time:

< 15 seconds.

The demo should be deployable on a single cloud environment and usable during investor presentations.
