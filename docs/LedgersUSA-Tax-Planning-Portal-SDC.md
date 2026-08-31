# LedgersUSA Tax Planning Portal
## Software Development & Delivery Specification (SDC)
### AI-Coding-Assistant Ready — Architecture, Implementation, Security, Testing & Deployment

**Document status:** Implementation baseline  
**Source basis:** Existing LedgersUSA SDC + LedgersUSA Tax Planning Portal Product Architecture & SaaS Blueprint  
**Primary objective:** Provide one authoritative, implementation-ready specification that an AI coding assistant or engineering team can use to plan, build, test, secure, deploy, operate, and extend the platform without inventing core product requirements.

---

# 1. Executive Summary

The LedgersUSA Tax Planning Portal is a public-facing tax-planning platform that:

1. attracts prospects through SEO, education, referrals, and marketing;
2. sells a paid tax-planning diagnostic;
3. collects structured personal, income, business, planning, and document information;
4. evaluates submitted facts through a deterministic, rules-based strategy engine;
5. presents preliminary strategy insights and estimated savings ranges;
6. converts qualified users into reviewed planning engagements;
7. provides a secure client portal for plans, resources, documents, tasks, and implementation;
8. provides an internal LedgersUSA reviewer/admin workspace;
9. connects clients with approved specialist providers;
10. supports analytics, referrals, renewals, and later automation.

The product is deliberately designed as a **hybrid SaaS + advisory-services platform**. Automated recommendations are preliminary and educational; final tax advice is available only after the appropriate paid engagement and professional review.

The first release should prioritize three outcomes:

- paid diagnostic completion;
- useful preliminary strategy recommendations;
- conversion to reviewed planning engagements.

The architecture must nevertheless establish the foundations required for the later resource hub, marketplace, automation, renewals, analytics, and AI-assisted workflows.

---

# 2. Normative Language

The following terms are normative:

- **MUST** — mandatory for implementation.
- **MUST NOT** — prohibited.
- **SHOULD** — recommended unless a documented technical reason exists.
- **SHOULD NOT** — normally avoided.
- **MAY** — optional.
- **TBD** — requires an explicit product/business decision; an AI coding assistant MUST NOT silently invent a value.

---

# 3. Source-of-Truth Requirements

This document consolidates the supplied SDC and product specification.

The product specification establishes:

- four primary user types: Public Visitor, Diagnostic User, Planning Client, LedgersUSA Reviewer/Admin, plus Expert Provider;
- modules covering marketing, diagnostic intake, recommendation engine, client portal, CPA review, resource library, marketplace, and analytics;
- diagnostic pricing of $297–$597;
- reviewed-plan packaging ranging from $1,500 Starter through $7,500+ Premium/VFO;
- the six-section intake architecture;
- deterministic rules-based strategy scoring;
- preliminary versus reviewed recommendations;
- client tasks, documents, resources, messaging/notifications;
- reviewer queue and review actions;
- provider/referral functionality;
- PostgreSQL-centered data model;
- Next.js, React Native/Expo, Stripe, secure storage, authentication, analytics, and email integrations;
- phased MVP-to-scale delivery.

The original SDC specifies a modular monolith, TypeScript/Node.js, Next.js, Expo, PostgreSQL, Prisma, RBAC, Zod validation, RLS, secure storage, Stripe, and Resend. These architectural principles are retained and strengthened below.

---

# 4. Product Scope

## 4.1 In Scope

### Public
- Marketing website
- SEO strategy landing pages
- How It Works
- Pricing
- Resource Library public content where applicable
- Experts
- About
- Diagnostic checkout
- Login/signup

### Diagnostic
- Paid checkout
- Intake wizard
- Draft/resume intake
- Validation
- Intake submission
- Deterministic strategy evaluation
- Preliminary savings estimates
- Preliminary strategy package
- Upgrade CTA

### Client Portal
- Dashboard
- Diagnostic status
- Plan status
- Strategy workspaces
- Tasks
- Documents
- Resource library
- Reviewed plan delivery
- Notifications
- Expert referrals
- Annual renewal prompts

### Internal Review
- Review queue
- Assignment
- Intake review
- Strategy approval/removal/addition
- Assumption editing
- Reviewer notes
- Final report upload/generation
- Release controls
- Specialist referral assignment
- Audit trail

### Marketplace
- Provider directory
- Provider profiles
- Approval status
- Category/specialty
- Geography
- Referral creation/tracking
- Revenue-share tracking
- Listing/lead/referral monetization foundations

### Analytics
- Funnel analytics
- Diagnostic sales
- Upgrade conversion
- Review throughput
- Strategy usage
- Referral activity
- Revenue reporting

---

# 5. Explicit Non-Goals for MVP

Unless separately approved, MVP MUST NOT depend on:

- autonomous AI tax advice;
- autonomous filing of tax returns;
- direct IRS filing;
- automated legal advice;
- autonomous CPA approval;
- unreviewed document generation presented as professional advice;
- bank-account aggregation;
- direct access to client financial institutions;
- complex multi-tenant SaaS billing;
- provider payouts that require unsupported payment/compliance workflows.

AI MAY later assist with navigation, document routing, summarization, and operational workflows, but deterministic business rules and professional review remain authoritative.

---

# 6. User Roles & Authorization

## 6.1 Roles

```text
PROSPECT
CLIENT
ADMIN
REVIEWER
EXPERT
SUPER_ADMIN
```

`ADMIN` and `REVIEWER` SHOULD be separate application permissions even if the initial database role model groups them.

## 6.2 Permission Model

Use RBAC plus resource ownership checks.

Examples:

```text
client:
  diagnostic:read -> own diagnostic only
  diagnostic:update -> own draft only
  strategy:read -> own released results
  document:upload -> own permitted documents
  task:update -> own tasks
  referral:create -> own account

reviewer:
  review:read -> assigned/authorized review cases
  review:update
  recommendation:override
  recommendation:add
  recommendation:remove
  plan:release

admin:
  users:manage
  reviewers:manage
  providers:manage
  analytics:read
  content:manage

super_admin:
  all administrative permissions
  system configuration
```

Every API authorization decision MUST be server-side. UI hiding is not authorization.

---

# 7. Architecture

## 7.1 Architectural Pattern

Use a **Modular Monolith** with clear domain boundaries.

```text
                           INTERNET
                              |
                       CDN / WAF / TLS
                              |
                    Next.js Web Application
                 /             |                        Marketing       Client Portal      Admin
                              |
                       API / BFF Layer
                              |
                  Node.js TypeScript Backend
                              |
       +----------+-----------+-----------+-----------+
       |          |           |           |           |
      Auth     Intake      Rules       Review     Marketplace
       |        /Diag       Engine       /Plan       /Referral
       |          |           |           |           |
       +----------+-----------+-----------+-----------+
                              |
                       Domain Services
                              |
                  Prisma / PostgreSQL
                    |       |        |
                  RLS    Audit Log   Jobs
                              |
             +----------------+----------------+
             |                |                |
          Stripe           Storage           Email
                           S3/Supabase        Resend
```

Mobile clients use the same versioned backend API.

## 7.2 Frontend

Primary web application:

```text
Next.js + TypeScript
App Router
Tailwind CSS
Accessible component system
Server Components where appropriate
Client Components only where interaction/state requires them
```

Mobile:

```text
React Native + Expo + TypeScript
```

The mobile application MUST NOT duplicate business logic from the backend.

## 7.3 Backend

Preferred implementation:

```text
Node.js
TypeScript
NestJS
REST API
OpenAPI
Zod or class-validator at boundaries
Prisma ORM
PostgreSQL
```

If Express is selected instead, the same module boundaries, validation, OpenAPI, authorization, logging, testing, and error-contract requirements remain mandatory.

## 7.4 Repository

Use Turborepo:

```text
/apps
  /web
  /mobile
  /admin        # May initially be a route/application within web
/packages
  /api
  /db
  /auth
  /rules-engine
  /ui
  /config
  /types
  /validation
  /observability
  /storage
  /email
```

A separate `/apps/admin` is optional for MVP. If the admin UI lives in `/apps/web`, it MUST remain isolated through route groups and permission boundaries.

---

# 8. Domain Modules

The backend MUST be divided into modules:

```text
Auth
Users
ClientProfiles
BusinessProfiles
Diagnostics
Intake
Payments
Strategies
RulesEngine
Recommendations
Engagements
Reviews
Plans
Documents
Resources
Tasks
Notifications
Providers
Referrals
Analytics
Content
Audit
Health
```

Modules communicate through explicit application/domain interfaces rather than importing database internals arbitrarily.

---

# 9. API Design

## 9.1 Base URL

```text
/api/v1
```

All externally exposed APIs MUST be versioned.

## 9.2 Representative Endpoints

### Authentication
```http
GET    /api/v1/me
```

### Diagnostics
```http
POST   /api/v1/diagnostics
GET    /api/v1/diagnostics/:id
PATCH  /api/v1/diagnostics/:id
POST   /api/v1/diagnostics/:id/submit
```

### Payments
```http
POST   /api/v1/payments/diagnostic-checkout
POST   /api/v1/payments/engagement-checkout
POST   /api/v1/webhooks/stripe
```

### Strategies
```http
GET    /api/v1/diagnostics/:id/recommendations
GET    /api/v1/strategies/:code
```

### Review
```http
GET    /api/v1/reviews
GET    /api/v1/reviews/:id
POST   /api/v1/reviews/:id/assign
PATCH  /api/v1/reviews/:id
POST   /api/v1/reviews/:id/recommendations
POST   /api/v1/reviews/:id/release
```

### Documents
```http
POST   /api/v1/documents/presign
POST   /api/v1/documents/:id/complete
GET    /api/v1/documents
GET    /api/v1/documents/:id/download
```

### Tasks
```http
GET    /api/v1/tasks
PATCH  /api/v1/tasks/:id
```

### Marketplace
```http
GET    /api/v1/providers
GET    /api/v1/providers/:id
POST   /api/v1/referrals
```

## 9.3 API Rules

Every endpoint MUST have:

- authentication requirement;
- authorization policy;
- request schema;
- response schema;
- error contract;
- audit behavior where sensitive;
- rate-limit classification;
- tests.

Use idempotency keys for payment-sensitive and other retryable commands.

---

# 10. Canonical Error Contract

Use a stable machine-readable format:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "The request could not be processed.",
    "details": [
      {
        "field": "filingStatus",
        "code": "INVALID_ENUM"
      }
    ],
    "requestId": "..."
  }
}
```

Do not expose stack traces, SQL errors, provider secrets, or sensitive diagnostic data.

---

# 11. Intake Questionnaire

## Section 1 — Personal Profile

Required fields:

```text
first_name
last_name
email
phone
state_of_residence
marital_status
tax_filing_status
dependents
```

## Section 2 — Income Profile

```text
w2_income
business_income
k1_income
investment_income
rental_income
estimated_total_household_income
estimated_marginal_tax_bracket
```

## Section 3 — Business Profile

```text
business_owner
business_type
entity_structure
number_of_owners
annual_business_revenue
annual_business_profit
number_of_employees
bookkeeping_status
```

## Section 4 — Tax Planning Qualifiers

```text
home_business_meetings
home_office_use
children_work_in_business
business_vehicle_use
retirement_plan_in_place
charitable_giving_level
state_income_tax_burden
real_estate_ownership
interest_in_advanced_planning
```

## Section 5 — Goals & Priorities

```text
reduce_current_taxes
improve_cash_flow
build_retirement_savings
charitable_planning
estate_planning_coordination
wealth_building
```

## Section 6 — Documents

Optional initially; required for upgraded plans as defined by engagement policy:

```text
prior_year_tax_return
current_year_financials
payroll_reports
entity_documents
```

Questionnaire schemas MUST be versioned so that historical submissions remain reproducible.

---

# 12. Intake State Machine

```text
DRAFT
  |
  v
CHECKOUT_PENDING
  |
  v
PAID
  |
  v
IN_PROGRESS
  |
  v
SUBMITTED
  |
  v
SCORING
  |
  v
PRELIMINARY_READY
  |
  +--------------------+
  |                    |
  v                    v
SELF_SERVICE       UPGRADE_PENDING
                       |
                       v
                    PAID
                       |
                       v
                 REVIEW_QUEUED
                       |
                       v
                 UNDER_REVIEW
                       |
                       v
                 APPROVED
                       |
                       v
                  RELEASED
```

State transitions MUST be validated by the backend.

---

# 13. Payment Architecture

Use Stripe for payment processing.

## 13.1 Principles

- Never store raw card details.
- Treat Stripe webhook events as authoritative for payment state.
- Verify webhook signatures.
- Make webhook handling idempotent.
- Store Stripe customer/payment identifiers.
- Separate product catalog configuration from application logic.
- Prices MUST be environment/configuration driven.

## 13.2 Products

Diagnostic:

```text
$297–$597
```

Reviewed plans:

```text
Starter:   $1,500
Core:      $2,500–$3,500
Advanced:  $4,000–$6,000
Premium:   $7,500+
```

Exact live prices MUST be configured in Stripe and referenced by environment/configuration IDs rather than hardcoded amounts throughout application code.

---

# 14. Rules-Based Strategy Engine

## 14.1 Design Principle

The recommendation engine MUST be deterministic.

Input:

```json
{
  "schemaVersion": "1.0",
  "facts": {}
}
```

Output:

```json
{
  "engineVersion": "1.0.0",
  "recommendations": [],
  "scoreSummary": {},
  "warnings": []
}
```

Same normalized input + same engine version + same rule configuration MUST produce the same output.

## 14.2 Strategy Catalog

Initial strategy codes:

```text
AUGUSTA_RULE
ACCOUNTABLE_PLAN
S_CORP_OPTIMIZATION
HIRING_CHILDREN
VEHICLE_DEDUCTION
SOLO_401K_OPTIMIZATION
SALT_PTE_ELECTION
DONOR_ADVISED_FUND
CHARITABLE_PLANNING
RETIREMENT_PLANNING
```

## 14.3 Scoring Dimensions

Each strategy SHOULD score:

```text
eligibility
income_suitability
entity_fit
implementation_readiness
value_potential
```

Use a transparent scoring model.

Example:

```text
score = weighted_sum(
  eligibility,
  income_suitability,
  entity_fit,
  implementation_readiness,
  value_potential
)
```

Do not place tax-law assumptions directly in controllers or UI components.

## 14.4 Strategy Rule Definition

Store/version rules as structured configuration:

```yaml
strategy_code: AUGUSTA_RULE
version: 1.0.0
enabled: true
weights:
  eligibility: 0.30
  income_suitability: 0.20
  entity_fit: 0.20
  implementation_readiness: 0.10
  value_potential: 0.20
conditions:
  - ...
```

The implementation MUST support rule versioning.

## 14.5 Tax-Law Safety

The product specification provides high-level triggers but does not provide a complete tax-law rules matrix, thresholds, state rules, legal citations, or calculation methodology.

Therefore:

**An AI coding assistant MUST NOT invent missing tax thresholds, eligibility limits, savings formulas, legal conclusions, or state-specific tax rules.**

Those values MUST be supplied and approved by LedgersUSA tax professionals before production activation.

---

# 15. Recommendation Lifecycle

```text
PRELIMINARY
   |
   +--> REVIEW_REQUIRED
   |
   v
UNDER_REVIEW
   |
   +--> REMOVED
   |
   +--> APPROVED
   |
   +--> MODIFIED
            |
            v
         APPROVED
```

Every reviewer override MUST record:

```text
original value
new value
reason
reviewer
timestamp
rule version
```

Never mutate historical recommendation evidence without retaining an audit record.

---

# 16. Savings Estimate Model

A recommendation MAY contain:

```text
estimated_savings_low
estimated_savings_high
currency
calculation_version
assumptions[]
confidence/qualification notes
```

The system MUST distinguish:

- estimated savings;
- potential savings;
- reviewed estimate;
- actual realized savings.

The UI MUST NOT present an estimate as guaranteed tax savings.

Savings calculations MUST be versioned and test-covered.

---

# 17. Client Portal

## Dashboard

Display:

- diagnostic status;
- upgrade status;
- plan status;
- recommended strategies;
- estimated savings range;
- outstanding tasks;
- unlocked resources;
- review status;
- notifications.

## Strategy Workspace

Each strategy supports:

```text
overview
why_it_may_fit
eligibility_notes
estimated_savings
implementation_steps
documentation_required
templates
calculators
FAQs
audit/compliance_notes
review_status
```

## Task Management

Example tasks:

```text
sign agreement
upload tax return
download board resolution
complete rent analysis
submit accountable-plan reimbursements
choose payroll provider
```

Task generation SHOULD be strategy-driven and template-based.

---

# 18. Documents & Secure Storage

Tax returns and financial documents are highly sensitive.

## Requirements

- private object storage;
- server-issued short-lived signed URLs;
- encryption at rest;
- TLS in transit;
- MIME/type validation;
- file-size limits;
- malware scanning before release where feasible;
- immutable document metadata;
- access logging;
- no public buckets;
- no permanent public file URLs.

Database SHOULD store metadata rather than document binaries:

```text
document_id
owner_id
strategy_id
storage_key
document_type
original_filename
mime_type
size_bytes
checksum
status
uploaded_at
uploaded_by
```

---

# 19. Client/Reviewer Document Access

Access MUST be policy-driven.

A client can access only their own documents.

A reviewer can access documents only for authorized review cases.

Signed URLs MUST expire.

Every sensitive download SHOULD create an audit event.

---

# 20. CPA / Reviewer Workspace

## Queue

Columns:

```text
client
diagnostic_paid_date
entity_type
income_band
current_status
preliminary_strategies
assigned_reviewer
target_completion_date
upgrade_status
```

## Reviewer Actions

```text
approve strategy
remove strategy
add strategy
edit assumptions
add notes
request information
upload final report
release final plan
assign specialist
```

## Review Workflow

```text
UNASSIGNED
  |
  v
ASSIGNED
  |
  v
IN_REVIEW
  |
  +--> NEEDS_CLIENT_INFO
  |        |
  |        v
  |     IN_REVIEW
  |
  v
READY_FOR_APPROVAL
  |
  v
APPROVED
  |
  v
RELEASED
```

A release operation MUST be explicit and auditable.

---

# 21. Expert Marketplace

Provider categories:

```text
payroll
bookkeeping
QBO setup/cleanup
business attorney
estate attorney
retirement advisor
insurance specialist
valuation specialist
real estate cost segregation specialist
```

Provider fields:

```text
provider_id
business_name
category
service_specialties
states_served
bio
credentials
website
booking_link
pricing_model
approval_status
referral_status
contact_information
```

Referral records:

```text
referral_id
client_id
provider_id
strategy_code
status
revenue_share
created_at
updated_at
```

Provider approval MUST be an administrative action.

---

# 22. Notifications

Support:

```text
email
in-app notifications
push notifications (mobile, later)
```

Notification events:

```text
payment_confirmed
intake_incomplete
intake_submitted
preliminary_plan_ready
upgrade_completed
review_started
information_requested
plan_ready
task_due
implementation_deadline
annual_renewal
referral_created
```

Use an asynchronous job mechanism for email and other non-critical notifications.

---

# 23. Background Jobs

Introduce a job abstraction from the beginning.

Suggested jobs:

```text
process_email_notifications
generate_preliminary_package
generate_tasks
process_document_scan
send_task_reminders
send_review_reminders
generate_reports
annual_renewal_prompts
analytics_rollups
```

Jobs MUST be idempotent and retry-safe.

---

# 24. Database Design

Use PostgreSQL.

The original source lists core entities. Production implementation SHOULD normalize and extend them.

Core tables:

```text
users
client_profiles
business_profiles
diagnostics
intake_submissions
intake_answers
strategy_definitions
strategy_rule_versions
strategy_recommendations
recommendation_events
engagements
reviews
review_assignments
plans
plan_versions
documents
document_access_events
tasks
resources
providers
provider_services
referrals
payments
subscriptions_or_renewals
notifications
audit_logs
```

## 24.1 UUIDs

Use UUID primary keys.

## 24.2 Timestamps

All persisted timestamps MUST be timezone-aware and stored in UTC.

## 24.3 Soft Deletion

Sensitive/business-critical records SHOULD use explicit status/deactivation rather than destructive deletion.

Hard deletion MUST follow documented retention rules.

---

# 25. Suggested Relational Relationships

```text
User 1---1 ClientProfile
User 1---N BusinessProfile
User 1---N Diagnostic
Diagnostic 1---1 IntakeSubmission
Diagnostic 1---N Recommendation
Diagnostic 0---1 Engagement
Engagement 1---N Review
Review 1---N RecommendationEvent
Plan 1---N PlanVersion
Plan 1---N Task
Plan 1---N Document
StrategyDefinition 1---N RuleVersion
Provider 1---N Referral
User 1---N Referral
```

Business ownership SHOULD support multiple businesses per client.

---

# 26. Database Security / RLS

If Supabase is used, PostgreSQL Row-Level Security MUST be enabled for PII/financial tables.

If a managed PostgreSQL provider without Supabase RLS is selected, equivalent application-level authorization and database controls MUST be implemented.

RLS policies MUST be tested.

Do not rely on client-supplied `user_id`.

Derive identity from authenticated claims/server context.

---

# 27. Audit Logging

Audit sensitive actions:

```text
login
role_changed
diagnostic_created
diagnostic_submitted
payment_confirmed
document_uploaded
document_downloaded
document_deleted
recommendation_created
recommendation_modified
recommendation_removed
review_assigned
review_started
plan_approved
plan_released
provider_approved
referral_created
admin_configuration_changed
```

Audit record:

```text
audit_id
actor_id
action
entity_type
entity_id
before_snapshot
after_snapshot
request_id
ip_hash_or_policy-compliant-network-metadata
user_agent
created_at
```

Avoid storing unnecessary secrets or raw sensitive payloads.

---

# 28. Authentication

The existing SDC allows Clerk/Auth0.

Select one provider during implementation kickoff.

Authentication MUST support:

- secure signup/login;
- email verification where configured;
- passwordless or MFA capability where appropriate;
- session management;
- role claims;
- account recovery;
- secure logout.

Do not duplicate password storage if a managed identity provider is used.

---

# 29. Security Baseline

Minimum controls:

- TLS;
- secure headers;
- CSRF protection where applicable;
- strict CORS;
- rate limiting;
- request validation;
- output encoding;
- SQL injection prevention through parameterized ORM queries;
- XSS protection;
- secure cookies;
- secret management;
- dependency scanning;
- container/image scanning;
- least-privilege service accounts;
- audit logs;
- encrypted storage;
- signed document URLs;
- webhook signature verification.

Never commit:

```text
.env
API keys
Stripe secrets
database passwords
auth secrets
private signing keys
storage credentials
```

---

# 30. Privacy & Compliance

The platform handles tax-related and financial information.

The product MUST provide appropriate:

- Terms of Service;
- Privacy Policy;
- tax-planning disclaimer;
- consent/acknowledgement mechanisms where required;
- document handling disclosures;
- professional-review distinction.

Diagnostic output MUST be clearly labelled:

> preliminary strategy insights / educational recommendations / subject to review and validation

Final tax advice MUST be clearly associated with the appropriate LedgersUSA professional engagement and review.

Legal/compliance text MUST be approved by qualified counsel or LedgersUSA leadership before production.

---

# 31. Frontend Information Architecture

```text
/
 /how-it-works
 /strategies
   /augusta-rule
   /accountable-plan
   /s-corp-optimization
   /hiring-children
   /vehicle-deduction
   /solo-401k
   /salt-pte
   /donor-advised-fund
   /charitable-planning
   /retirement-planning
 /pricing
 /resources
 /experts
 /about
 /diagnostic
 /checkout
 /login
 /portal
   /dashboard
   /strategies
   /tasks
   /documents
   /resources
   /marketplace
   /settings
 /admin
   /reviews
   /clients
   /providers
   /analytics
   /content
```

---

# 32. SEO

Marketing pages MUST be:

- server-rendered where beneficial;
- crawlable;
- semantically structured;
- metadata-driven;
- Open Graph enabled;
- sitemap-enabled;
- robots.txt configured;
- canonicalized;
- optimized for Core Web Vitals.

Target Lighthouse performance score: **90+** for marketing pages under representative production conditions.

SEO content MUST NOT make unsupported tax claims.

---

# 33. Design System

Use a shared component system.

Core components:

```text
Button
Input
Select
Checkbox
RadioGroup
CurrencyInput
DateInput
FormSection
ProgressStepper
StrategyCard
SavingsRange
StatusBadge
TaskCard
DocumentCard
DataTable
ReviewPanel
Modal
Drawer
Toast
Alert
EmptyState
LoadingState
ErrorState
```

Accessibility target:

```text
WCAG 2.2 AA
```

Keyboard navigation and semantic HTML are mandatory.

---

# 34. UX Principles

The portal MUST make clear:

1. what stage the user is in;
2. what is complete;
3. what remains;
4. what the estimated value is;
5. what is preliminary;
6. what requires professional review;
7. what action should happen next.

Never use savings estimates as dark-pattern pressure.

---

# 35. Analytics

Track business funnel events:

```text
landing_view
strategy_page_view
pricing_view
diagnostic_started
checkout_started
checkout_completed
intake_completed
preliminary_plan_viewed
upgrade_viewed
upgrade_checkout_started
upgrade_completed
review_started
review_completed
plan_released
resource_downloaded
referral_created
renewal_started
```

Do not send unnecessary tax/PII fields to analytics providers.

Use pseudonymous IDs.

---

# 36. Observability

Implement:

```text
structured logs
request IDs
metrics
error tracking
health checks
readiness checks
```

Recommended health endpoints:

```http
GET /health
GET /ready
```

Monitor:

- API latency;
- error rate;
- database latency;
- queue failures;
- payment webhook failures;
- rules-engine latency;
- document failures;
- email failures;
- review SLA.

Rules-engine target from source:

```text
<100ms response time
```

This should be measured independently from network/API overhead.

---

# 37. Performance

Targets:

- rules engine: <100ms under defined benchmark;
- marketing Lighthouse: 90+;
- API p95 target SHOULD be established during load testing;
- database queries indexed around primary access paths;
- asynchronous processing for expensive report/document tasks;
- CDN for static assets;
- pagination for all potentially large lists.

Do not optimize by prematurely introducing microservices.

---

# 38. Scalability

The backend MUST be stateless.

Scaling model:

```text
Load Balancer
     |
     +-- API instance
     +-- API instance
     +-- API instance
             |
        PostgreSQL
             |
        Job Queue
```

No session state should live only in application memory.

Tax-season spikes MUST be handled through horizontal scaling and asynchronous jobs.

---

# 39. Caching

Use caching selectively for:

- public strategy content;
- public resource metadata;
- provider directory data;
- static configuration.

Do NOT cache private financial/tax responses in shared caches.

Recommendation results SHOULD be persisted rather than relying on ephemeral caches.

---

# 40. Configuration Management

Environment variables/configuration MUST control:

```text
DATABASE_URL
AUTH configuration
STRIPE keys
STRIPE price IDs
STORAGE configuration
EMAIL configuration
APP_BASE_URL
API_BASE_URL
ANALYTICS IDs
SENTRY/observability configuration
QUEUE configuration
```

Never hardcode environment-specific URLs or secrets.

Provide:

```text
.env.example
```

with names only and safe placeholder values.

---

# 41. Environments

At minimum:

```text
local
development
staging
production
```

Recommended:

```text
preview
```

Rules:

- production secrets MUST never be used locally;
- staging MUST use separate payment credentials/products where practical;
- production database access MUST be restricted;
- migrations MUST be reviewed before production;
- backups MUST be configured.

---

# 42. Deployment

Preferred deployment model consistent with the source:

```text
Next.js -> Vercel or equivalent
Node API -> managed container/runtime
PostgreSQL -> managed PostgreSQL/Supabase
Storage -> Supabase Storage or AWS S3
Payments -> Stripe
Email -> Resend
```

The architecture MUST remain portable enough to move providers.

---

# 43. CI/CD

Every pull request SHOULD execute:

```text
format check
lint
typecheck
unit tests
integration tests
build
dependency/security checks
database migration validation
```

Production deployment:

```text
merge to protected main
        |
        v
CI
        |
        v
Build artifacts
        |
        v
Deploy staging
        |
        v
Smoke tests
        |
        v
Approval
        |
        v
Production
        |
        v
Post-deploy health checks
```

Use protected branches and required reviews.

---

# 44. Database Migration Rules

Use Prisma migrations.

Rules:

- migrations are immutable once applied;
- no manual production schema edits except emergency procedures;
- destructive migrations require explicit review;
- backwards-compatible migrations SHOULD precede application changes;
- production backups MUST exist before risky migrations.

---

# 45. Testing Strategy

## Unit

Test:

- rules;
- scoring;
- savings calculations;
- state transitions;
- authorization policies;
- validation schemas;
- task generation.

## Integration

Test:

- database repositories;
- Stripe webhook processing;
- storage access;
- authentication integration;
- email jobs;
- API modules.

## End-to-End

Critical journeys:

```text
visitor -> diagnostic purchase -> intake -> preliminary results
client -> upgrade -> payment -> review queue
reviewer -> review -> modify -> approve -> release
client -> document upload -> task completion
client -> provider referral
```

## Security Testing

Include:

- authorization bypass;
- IDOR;
- role escalation;
- signed URL abuse;
- webhook replay;
- rate-limit bypass;
- injection;
- XSS;
- CSRF where relevant.

---

# 46. Rules Engine Test Matrix

Every strategy MUST have tests for:

```text
clearly eligible
clearly ineligible
boundary conditions
missing information
conflicting facts
different entity types
different income ranges
review-required scenarios
```

Each rule release MUST have a version and regression suite.

---

# 47. Seed Data

Development seed data MAY include:

- demo prospect;
- demo client;
- demo reviewer;
- demo expert;
- sample strategies;
- sample resources;
- sample tasks;
- sample diagnostic;
- sample recommendations.

Never seed real personal/tax data.

---

# 48. Content Management

The system SHOULD separate content from application code where practical.

Content types:

```text
strategy page
resource
FAQ
implementation guide
calculator metadata
provider profile
legal/disclaimer content
```

Content changes MUST NOT alter tax calculation logic.

---

# 49. Resource Library

Support:

```text
Word templates
Excel calculators
PDF explainers
checklists
implementation guides
sample completed documents
```

Resources MUST have:

```text
resource_id
title
description
type
strategy_code
access_level
version
storage_key
published_at
updated_at
```

Access levels:

```text
PUBLIC
DIAGNOSTIC
REVIEWED_CLIENT
ADMIN
```

---

# 50. Pricing & Entitlements

Do not infer access from payment alone.

Create explicit entitlement records or a deterministic entitlement service.

Example:

```text
DIAGNOSTIC_ACCESS
PRELIMINARY_RESULTS
SELF_SERVICE_TOOLKIT
REVIEWED_PLAN
ADVANCED_RESOURCES
PREMIUM_SUPPORT
MARKETPLACE_ACCESS
```

Payments grant entitlements through verified payment events.

---

# 51. Engagements

An engagement records the commercial relationship:

```text
engagement_id
client_id
package_type
fee_amount
currency
agreement_status
start_date
target_completion_date
completion_status
created_at
updated_at
```

Suggested statuses:

```text
PENDING_PAYMENT
PAID
AGREEMENT_PENDING
ACTIVE
ON_HOLD
COMPLETED
CANCELLED
```

---

# 52. Auditability of Professional Review

The system MUST preserve a clear chain:

```text
client facts
   -> intake version
   -> rule version
   -> preliminary recommendation
   -> reviewer changes
   -> reviewer identity
   -> assumptions
   -> final plan version
   -> release timestamp
```

A released plan MUST be immutable as a version.

Corrections create a new version.

---

# 53. API Idempotency

Commands that can be retried MUST be idempotent.

Examples:

```text
create checkout session
process payment webhook
submit intake
release plan
create referral
send notification
```

Use idempotency keys/event IDs and unique database constraints.

---

# 54. Rate Limiting

Apply differentiated limits:

```text
public endpoints -> stricter
authentication -> very strict
diagnostic submission -> moderate
admin endpoints -> authenticated limits
webhooks -> signature + replay protection
```

Never rate-limit based only on a user-controlled identifier.

---

# 55. Data Retention

Retention periods are not specified in the supplied product specification.

Therefore:

**TBD — LedgersUSA/legal policy must define retention and deletion requirements before production.**

Implementation SHOULD nevertheless provide configurable retention policies rather than embedding arbitrary periods.

---

# 56. Backup & Disaster Recovery

Production PostgreSQL MUST have:

- automated backups;
- point-in-time recovery where supported;
- tested restoration procedure.

Object storage MUST have:

- versioning where appropriate;
- lifecycle policies;
- recovery procedure.

Document and database recovery MUST be tested before launch.

---

# 57. Disaster Recovery Objectives

Exact RPO/RTO values are not specified by the source.

Therefore:

```text
RPO: TBD
RTO: TBD
```

Engineering MUST obtain approved targets before production readiness sign-off.

---

# 58. Deployment Checklist

## Infrastructure

- [ ] production domain configured
- [ ] TLS active
- [ ] CDN/WAF configured
- [ ] production database provisioned
- [ ] database backups verified
- [ ] object storage private
- [ ] authentication configured
- [ ] Stripe production account configured
- [ ] Resend production sender configured
- [ ] observability configured
- [ ] secrets configured
- [ ] CI/CD configured

## Application

- [ ] database migrations applied
- [ ] seed data excluded from production
- [ ] role permissions verified
- [ ] RLS/authorization tested
- [ ] webhook verification tested
- [ ] document access tested
- [ ] rules-engine regression suite passed
- [ ] legal/disclaimer copy approved
- [ ] pricing approved
- [ ] SEO metadata validated
- [ ] accessibility checks passed

---

# 59. AI Coding Assistant Operating Rules

An AI coding assistant implementing this project MUST follow these rules.

## 59.1 Never Invent Requirements

If a requirement is absent or marked TBD:

```text
STOP -> identify missing decision -> request clarification
```

Do not invent tax-law thresholds or legal rules.

## 59.2 Preserve Domain Boundaries

Business logic belongs in domain/application services.

Do not place:

```text
tax rules in React components
payment state logic in UI
authorization only in frontend
database logic in controllers
```

## 59.3 Implement in Vertical Slices

Recommended order:

```text
1. repository/tooling foundation
2. auth + user profile
3. diagnostic + intake
4. Stripe payment
5. rules engine
6. preliminary results
7. engagement upgrade
8. reviewer workspace
9. plan release
10. documents/resources/tasks
11. notifications
12. marketplace/referrals
13. analytics
14. mobile
15. scale/automation
```

Each slice MUST be tested before proceeding.

## 59.4 Definition of Done

A feature is complete only when:

- types compile;
- validation exists;
- authorization exists;
- database migration exists if needed;
- API contract exists;
- UI handles loading/error/empty/success states;
- tests exist;
- audit behavior is implemented where required;
- observability exists for critical flows;
- documentation is updated.

---

# 60. Recommended Project Structure

```text
ledgersusa/
├── apps/
│   ├── web/
│   │   ├── app/
│   │   │   ├── (marketing)/
│   │   │   ├── (auth)/
│   │   │   ├── portal/
│   │   │   └── admin/
│   │   └── components/
│   └── mobile/
├── packages/
│   ├── api/
│   ├── db/
│   ├── rules-engine/
│   ├── auth/
│   ├── ui/
│   ├── validation/
│   ├── storage/
│   ├── email/
│   ├── observability/
│   └── config/
├── prisma/
│   ├── schema.prisma
│   └── migrations/
├── docs/
│   ├── architecture/
│   ├── api/
│   ├── rules/
│   ├── security/
│   ├── deployment/
│   └── decisions/
├── tests/
├── .env.example
├── turbo.json
├── package.json
└── README.md
```

---

# 61. Architecture Decision Records

Maintain ADRs for decisions including:

```text
ADR-001 Modular monolith
ADR-002 Authentication provider
ADR-003 PostgreSQL/Supabase
ADR-004 REST API
ADR-005 Rules-engine architecture
ADR-006 Storage provider
ADR-007 Payment architecture
ADR-008 Background jobs
ADR-009 Audit logging
ADR-010 Deployment platform
```

---

# 62. MVP Scope

MVP MUST deliver:

1. homepage;
2. strategy landing pages;
3. pricing;
4. authentication;
5. paid diagnostic checkout;
6. intake wizard;
7. persisted intake;
8. deterministic rules engine;
9. preliminary strategy package;
10. savings range presentation;
11. basic client dashboard;
12. upgrade checkout;
13. internal review tracker;
14. reviewer recommendation modification;
15. reviewed-plan release.

This aligns with the source's recommended fastest-launch scope.

---

# 63. Phase 2

Add:

- resource library;
- document management;
- task tracking;
- reviewed-plan delivery;
- notifications;
- richer client portal.

---

# 64. Phase 3

Add:

- expert marketplace;
- provider onboarding;
- referral tracking;
- premium listings;
- referral economics.

---

# 65. Phase 4

Add:

- automated report generation;
- renewals;
- advanced analytics;
- partner/channel workflows;
- AI assistance for navigation and document routing.

AI MUST remain assistive and subordinate to deterministic rules and professional review.

---

# 66. Acceptance Criteria

The platform is MVP-ready only when all of the following work end-to-end:

### Diagnostic

```text
visitor
 -> checkout
 -> payment confirmation
 -> intake
 -> submit
 -> rules engine
 -> preliminary recommendations
 -> savings range
```

### Upgrade

```text
client
 -> upgrade
 -> payment
 -> engagement
 -> review queue
```

### Review

```text
reviewer
 -> assigned case
 -> inspect facts
 -> inspect recommendations
 -> modify/add/remove
 -> save
 -> approve
 -> release
```

### Client Delivery

```text
client
 -> receives released plan
 -> views strategies
 -> accesses permitted resources
 -> completes tasks
 -> downloads permitted documents
```

### Security

```text
client A MUST NOT access client B's:
  diagnostics
  recommendations
  documents
  tasks
  engagement
  plan
```

### Audit

All professional overrides and releases MUST be traceable to the responsible user and plan/recommendation version.

---

# 67. Open Decisions Requiring Business Approval

The supplied sources do not fully specify:

1. final authentication provider: Clerk vs Auth0;
2. final backend framework: NestJS vs Express;
3. final storage provider: Supabase Storage vs AWS S3;
4. final database hosting choice;
5. final exact diagnostic price;
6. final exact plan prices;
7. complete tax-rule matrix;
8. savings calculation methodology;
9. state-specific tax rules;
10. document retention period;
11. RPO/RTO;
12. exact legal/disclaimer wording;
13. reviewer SLA;
14. exact referral fee/revenue-share policy;
15. exact provider payout mechanism;
16. CRM/practice-management integration requirements.

An implementation agent MUST surface these decisions rather than silently choosing values that affect business, tax, legal, or compliance behavior.

---

# 68. Recommended Initial Technical Defaults

Where the business has approved the general architecture but has not selected a specific vendor, the recommended engineering defaults are:

```text
Monorepo:       Turborepo
Language:       TypeScript
Web:            Next.js
Mobile:         Expo React Native
Backend:        NestJS
API:            REST + OpenAPI
ORM:            Prisma
Database:       PostgreSQL
Validation:     Zod
Auth:           Clerk or Auth0 — decision required
Payments:       Stripe
Storage:        Supabase Storage or AWS S3 — decision required
Email:          Resend
Analytics:      PostHog + Google Analytics
Deployment:     Vercel + managed Node runtime
Testing:        Vitest/Jest + Playwright
Observability:  structured logging + error monitoring
```

These are implementation defaults, not replacements for unresolved business decisions.

---

# 69. Final Architectural Principle

The LedgersUSA Tax Planning Portal MUST be built as a **secure, auditable, deterministic, modular advisory platform**, not as a generic AI chatbot.

The authoritative chain is:

```text
Verified Client Facts
        ↓
Versioned Intake
        ↓
Versioned Deterministic Rules
        ↓
Preliminary Strategy Insights
        ↓
Paid Professional Review
        ↓
Reviewer Overrides + Audit Trail
        ↓
Immutable Released Plan Version
        ↓
Implementation Resources + Tasks
        ↓
Specialist Referrals
        ↓
Renewal / Continuous Planning
```

The system should be easy for an AI coding assistant to navigate because every domain has an explicit boundary, every sensitive operation has authorization and audit requirements, every rules calculation is versioned, and every unresolved business/legal/tax decision is explicitly marked rather than guessed.

---

# 70. Implementation Kickoff Sequence

An AI coding assistant should begin by producing, in order:

```text
1. Repository/monorepo scaffold
2. Architecture README
3. ADRs
4. Environment/configuration system
5. PostgreSQL/Prisma schema
6. Authentication integration
7. RBAC/policy layer
8. Intake schemas and state machine
9. Diagnostic API
10. Stripe checkout + verified webhooks
11. Rules-engine package + versioning
12. Strategy catalog/rules matrix
13. Preliminary result API/UI
14. Engagement + upgrade flow
15. Review queue/workspace
16. Plan versioning/release workflow
17. Document storage/access layer
18. Tasks/resources
19. Notifications/jobs
20. Marketplace/referrals
21. Analytics
22. E2E/security testing
23. CI/CD
24. staging deployment
25. production readiness review
```

At every stage, the assistant MUST keep the implementation consistent with this SDC and MUST stop for unresolved product, tax, legal, security, or infrastructure decisions rather than making assumptions.

---

**End of SDC**
