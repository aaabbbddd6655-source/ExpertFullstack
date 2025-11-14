# Ivea Order Tracking Platform

## Overview

The Ivea Order Tracking Platform is a production-ready, fully functional web application for tracking custom interior decor orders through a complete lifecycle: from raw materials procurement through production, quality control, delivery, and installation. The platform features two distinct interfaces:

1. **Customer Portal** - A premium, minimal interface where customers can track their orders using phone number + order number authentication
2. **Admin Dashboard** - A comprehensive operations interface for managing orders, stages, appointments, and customer communications

The system integrates with external e-commerce platforms via webhooks and provides automated email notifications at key order milestones.

**Current Status:** ✅ **Production Ready** - All features implemented, tested, and verified working with real database and API integration.

**Recent Updates (Nov 2025):**
- ✅ **Enhanced StageManager Component** - Full CRUD operations for order stages
  - View all stages in expandable accordion with status badges and icons
  - Add Stage: Dialog with dropdown of all 13 stage types, supports duplicate stages for complex workflows
  - Edit Stage: Inline form with status selector and notes, immediate UI updates via refetchQueries
  - Delete Stage: Confirmation dialog, restricted to PENDING stages only for data safety
  - Form remounting via dynamic keys ensures fresh data display after mutations
  - All operations tested end-to-end with Playwright verification
- ✅ **Order Page Enhancements** - Short order IDs, Quick Actions dialogs, enhanced order management
  - Short Order ID Display: Converts long IDs (IV-1763076259627-UX0QEH) to readable format (IV-9627UH)
  - Quick Actions: Send Email Updates, Add Media (photos/docs), Cancel Order with confirmation
  - Backend APIs: Stage CRUD operations, custom email notifications, order cancellation
  - All dialogs use proper async state management and validation
- ✅ Added Dashboard page with real-time order statistics, customer metrics, and recent activity
- ✅ Added Customers page with search functionality and order counts per customer
- ✅ Added Settings page for user profile and system information
- ✅ Implemented New Order creation with decimal currency support (numeric 10,2)
- ✅ Updated admin credentials to match "Ivea" branding (admin@ivea.com)
- ✅ Fixed backend API to return complete customer data for all pages
- ✅ All features validated with end-to-end testing

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework & Tooling:**
- React 18+ with TypeScript for type safety
- Vite as the build tool and development server
- Client-side routing with Wouter (lightweight alternative to React Router)
- Path aliases configured for clean imports (`@/` for client components, `@shared/` for shared types)

**State Management & Data Fetching:**
- TanStack Query (React Query) for server state management, caching, and automatic refetching
- React Hook Form with Zod for form handling and validation
- Local state with useState/useContext where appropriate

**UI/Design System:**
- Tailwind CSS for utility-first styling with custom design tokens
- Shadcn UI components (Radix UI primitives) for accessible, customizable components
- Dual design language: Premium minimal for customer portal, data-dense utility for admin dashboard
- Custom CSS variables for theming (light/dark mode support)
- Typography: Inter for body text, Playfair Display for premium serif accents

**Component Architecture:**
- Separation between customer-facing and admin components
- Reusable UI primitives in `components/ui/`
- Feature-specific components in `components/`
- Page-level components in `pages/`

### Backend Architecture

**Runtime & Framework:**
- Node.js with Express.js for the HTTP server
- TypeScript for type safety across the entire backend
- ES modules (type: "module" in package.json)

**API Design:**
- RESTful API endpoints with clear separation:
  - `/api/public/*` - Unauthenticated customer endpoints
  - `/api/admin/*` - JWT-protected admin endpoints
  - `/api/webhooks/*` - External integration endpoints
- JWT-based authentication with bcrypt password hashing
- Middleware for token verification and request logging

**Business Logic:**
- Storage abstraction layer (`server/storage.ts`) providing database operations interface
- Service layer for email notifications (`server/services/email.ts`)
- Pluggable architecture: email service uses interface pattern for easy swapping (console logs in development, ready for SendGrid/SES in production)

### Data Storage

**Database:**
- PostgreSQL as the primary data store (Neon-backed in Replit environment)
- Drizzle ORM for type-safe database queries and schema management
- Connection pooling via @neondatabase/serverless with WebSocket support

**Schema Design:**
- **Customers** - Core customer information (name, phone, email)
- **Users** - Admin/staff users with role-based access (ADMIN, OPERATIONS, PRODUCTION, QUALITY, INSTALLATION, SUPPORT)
- **Orders** - Order records with status tracking, linked to external e-commerce order IDs
- **OrderStages** - 13-stage workflow tracking (ORDER_RECEIVED through RATING)
- **OrderEvents** - Audit trail of all order changes
- **MediaFiles** - Photos and documents associated with orders/stages
- **InstallationAppointments** - Scheduling data for installation phase
- **CustomerRatings** - Post-installation feedback (5-star rating + comments)

**Data Flow:**
- Optimistic updates on frontend with TanStack Query
- Automatic cache invalidation after mutations
- Progress percentage calculated based on completed stages
- Stage status: PENDING → IN_PROGRESS → DONE

### Authentication & Authorization

**Customer Authentication:**
- Phone number + order number verification (no persistent sessions)
- Direct lookup without requiring account creation
- Single-use access pattern (re-enter credentials for each lookup)

**Admin Authentication:**
- JWT tokens stored in localStorage
- Token passed via Authorization header (Bearer scheme)
- Role-based access control with userRoleEnum (6 roles defined)
- Session management in `client/src/lib/auth.ts`

### External Dependencies

**Third-Party Services:**
- **Neon Database** - Serverless PostgreSQL hosting
- **Email Service** (interface ready) - Currently console-logged, designed for SendGrid/AWS SES integration
- **E-commerce Platform** - Incoming webhook endpoint `/api/webhooks/order-received` accepts order data from external systems

**API Integrations:**
- Webhook endpoint for order creation from e-commerce platform
- Webhook endpoint for internal status updates
- Designed for extensibility with additional webhook consumers

**Development Tools:**
- Replit-specific plugins for development (cartographer, dev banner, runtime error overlay)
- Drizzle Kit for database migrations
- ESBuild for production bundling

**Design Assets:**
- Custom fonts: Inter (sans-serif), Playfair Display (serif)
- Premium hero background image for customer portal
- Icon library: Lucide React

### Order Workflow

**13-Stage Process:**
1. ORDER_RECEIVED
2. SITE_MEASUREMENT  
3. DESIGN_APPROVAL
4. MATERIALS_PROCUREMENT
5. PRODUCTION_CUTTING
6. PRODUCTION_STITCHING
7. PRODUCTION_ASSEMBLY
8. FINISHING
9. QUALITY_CHECK
10. PACKAGING
11. DELIVERY_SCHEDULING
12. INSTALLATION
13. RATING

**Status Transitions:**
- Orders progress through statuses: PENDING_MEASUREMENT → DESIGN_APPROVAL → MATERIALS_PROCUREMENT → IN_PRODUCTION → QUALITY_CHECK → PACKAGING → READY_FOR_INSTALL → INSTALLED → COMPLETED
- Each stage tracks individual status (PENDING/IN_PROGRESS/DONE)
- Progress percentage calculated from completed stages
- Order events log all status changes and updates

**Email Automation:**
- Triggered at key milestones (order received, design approval needed, installation scheduled, completion)
- Template-based messages with order-specific details
- Ready for production email service integration