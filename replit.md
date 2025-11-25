# Ivea Order Tracking Platform

## Overview

The Ivea Order Tracking Platform is a production-ready, fully functional web application for tracking custom interior decor orders through a complete lifecycle: from raw materials procurement through production, quality control, delivery, and installation. The platform features two distinct interfaces:

1. **Customer Portal** - A premium, minimal interface where customers can track their orders using phone number + order number authentication
2. **Admin Dashboard** - A comprehensive operations interface for managing orders, stages, appointments, and customer communications

The system integrates with external e-commerce platforms via webhooks and provides automated email notifications at key order milestones.

**Current Status:** ✅ **Production Ready** - Fully bilingual (Arabic/English) with complete RTL support. All features implemented, tested, and verified working with real database and API integration.

**Recent Updates (Nov 25, 2025):**
- ✅ **User Management System** - Complete admin user management
  - List all users with roles and email
  - Create new users with name, email, password, and role
  - Edit existing users (name, email, role, password)
  - Delete users with confirmation dialog
  - Role-based badges (color-coded by role type)
  - Only ADMIN role can access user management
  - Full Arabic/English translations
- ✅ **Stage Type Settings** - Pre-configured 13 workflow stages
  - All stages seeded in database with Arabic names
  - Icons: Ruler, Calendar, CheckCircle, Palette, ShoppingCart, Factory, ClipboardCheck, Package, Truck, CalendarCheck, Wrench, Home, CheckCircle2
  - Added missing icons to IconPicker (Factory, CalendarCheck, CheckCircle2)
  - Seed script updated to auto-create stages on fresh database

**Previous Updates (Nov 15, 2025):**
- ✅ **Complete RTL Layout Support** - Full Right-to-Left layout implementation
  - Converted all directional CSS utilities to logical properties (ms-/me-/ps-/pe-/start-/end-)
  - Fixed 17 UI components for RTL compatibility (dropdown, select, sidebar, sheet, dialog, etc.)
  - All spacing uses gap instead of space-x- for RTL-safe layouts
  - Fixed positioning in AdminLogin, OrderLookup, StageManager, ScrollIndicator
  - Calendar navigation buttons now use logical positioning
  - Sidebar badges and action buttons use logical end- positioning
- ✅ **Translation Completeness** - Added 40+ missing translation keys
  - Stage Type Settings: stageTypeSettings, active/inactive, displayName, sortOrder, createError, etc.
  - Customers Page: description, totalOrders, activeOrders, addCustomerDescription, etc.
  - Dashboard Stats: admin.stats.completed now translates to "منجز" (Arabic) / "Completed" (English)
  - All admin.stages.* keys now complete in both languages
  - All admin.customers.* keys now complete in both languages
  - All admin.stats.* keys now complete in both languages
  - No translation keys show as raw text - everything displays properly in both languages
  - **End-to-end testing verified:** All pages (Dashboard, Settings, Customers) display correct translations in both languages
- ✅ **Stage Icon Customization System** - Complete icon management for order stages
  - Added icon column to stage_type_settings (text field, NOT NULL, default "Circle")
  - Seeded default icons for all 13 predefined stages (Package, Ruler, CheckCircle, ShoppingCart, Scissors, Sparkles, Box, Star, Package2, Truck, Wrench, MessageSquare)
  - Created IconPicker component with 17 curated lucide-react icons
  - Built "Add New Stage Type" dialog for creating custom workflow stages
  - Custom stage types support: any uppercase+underscore identifier (e.g., CUSTOM_INSPECTION)
  - Icons displayed dynamically in OrderTimeline and StageManager components
  - Database schema updated: stageType in settings changed from enum to text for extensibility
- ✅ **Fixed Stage Ordering** - Stable position regardless of status changes
  - getStagesByOrderId uses LEFT JOIN with stage_type_settings
  - Stages ordered by sortOrder from settings (with NULLS LAST)
  - Type casting (::text) ensures enum-to-text JOIN compatibility
  - Stage position maintained when transitioning PENDING → IN_PROGRESS → DONE
- ✅ **Custom Hook Architecture** - Shared data fetching pattern
  - Created useStageTypeSettings hook for admin components
  - createStageTypeMap utility for efficient icon/display name lookups
  - Used across OrderTimeline, StageManager, and StageTypeSettings

**Previous Updates (Nov 14, 2025):**
- ✅ **Media Files Display & Upload System** - Complete file upload and display functionality
  - Integrated Replit Object Storage for secure file storage
  - Uppy v5 drag-and-drop file uploader with dashboard UI
  - Media Files card on Admin Order Details page displays uploaded photos/documents
  - Security-hardened URL sanitization (path traversal protection)
  - Secure proxy endpoint for file access with cache headers
  - Support for external media URLs (CDNs, other sources)
  - Icons differentiate images vs documents, shows stage association
  - "View file" links open media in new tab
  - Shows "Invalid file URL" for malformed/unsafe URLs

**Previous Updates (Nov 2025):**
- ✅ **Year-Based Order Numbering System** - Clean, sequential order numbers
  - Format: IV-2025-0001 (year-based 4-digit sequence)
  - Transaction-safe generation with SELECT...FOR UPDATE to prevent duplicates
  - Year filter uses orderNumber pattern matching (not createdAt timestamp)
  - Maintains externalOrderId for webhook integration compatibility
  - All 8 existing orders backfilled with new format
  - Frontend displays orderNumber (not externalOrderId) everywhere
- ✅ **Enhanced Phone Normalization** - International and Saudi format support
  - International format (+country): Preserved as-is (e.g. +15551234567, +966501234567)
  - Saudi local with 0: 0501234567 → +966501234567
  - Saudi local without 0: 501234567 → +966501234567
  - Country code without +: 966501234567 → +966501234567
  - Order lookup validates phone AND order_number together for security
  - Single JOIN query with normalized phone matching
- ✅ **Bilingual System (Arabic/English)** - Full internationalization support
  - Language switcher in all page headers (customer & admin)
  - RTL (Right-to-Left) support for Arabic, LTR (Left-to-Right) for English
  - Translation files: en.json and ar.json with comprehensive UI text coverage
  - localStorage persistence of language preference
  - Automatic HTML dir attribute switching
  - Translated components: OrderLookup, CustomerTrackingPage, AdminLogin, AdminSidebar, toast messages
  - All user-facing text dynamically changes based on selected language
- ✅ **Enhanced StageManager Component** - Full CRUD operations for order stages
  - View all stages in expandable accordion with status badges and icons
  - Add Stage: Dialog with dropdown of all 13 stage types, supports duplicate stages for complex workflows
  - Edit Stage: Inline form with status selector and notes, immediate UI updates via refetchQueries
  - Delete Stage: Confirmation dialog, restricted to PENDING stages only for data safety
  - Form remounting via dynamic keys ensures fresh data display after mutations
  - All operations tested end-to-end with Playwright verification
- ✅ **Order Page Enhancements** - Quick Actions dialogs, enhanced order management
  - Order Number Display: Shows customer-friendly IV-2025-0001 format
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

**Object Storage:**
- Replit Object Storage (Google Cloud Storage backend) for media files
- Files uploaded to `.private/uploads/` directory with UUID filenames
- Served via secure proxy endpoint `/objects/:objectPath` with signed URLs
- ACL-based access control (public visibility for approved media)
- Cache headers for optimal performance (1 hour TTL)

**Schema Design:**
- **Customers** - Core customer information (name, phone in international format, email)
- **Users** - Admin/staff users with role-based access (ADMIN, OPERATIONS, PRODUCTION, QUALITY, INSTALLATION, SUPPORT)
- **Orders** - Order records with two ID types:
  - `orderNumber`: Customer-facing format IV-2025-0001 (year-based sequence, unique, NOT NULL)
  - `externalOrderId`: Webhook integration ID (e.g. EV-2024-0123, kept for compatibility)
  - Status tracking, linked to customers
- **OrderStages** - 13-stage workflow tracking (ORDER_RECEIVED through RATING)
- **OrderEvents** - Audit trail of all order changes
- **MediaFiles** - Photos and documents with object storage URLs, type (IMAGE/DOCUMENT), stage association
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
- Phone normalization supports international and Saudi local formats
- Order lookup validates BOTH fields together (phone AND orderNumber must match)
- Direct lookup without requiring account creation
- Single-use access pattern (re-enter credentials for each lookup)
- Format: Phone (+966501234567 or 0501234567) + Order Number (IV-2025-0001)

**Admin Authentication:**
- JWT tokens stored in localStorage
- Token passed via Authorization header (Bearer scheme)
- Role-based access control with userRoleEnum (6 roles defined)
- Session management in `client/src/lib/auth.ts`

### External Dependencies

**Third-Party Services:**
- **Neon Database** - Serverless PostgreSQL hosting
- **Replit Object Storage** - Google Cloud Storage for media files (photos, documents)
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