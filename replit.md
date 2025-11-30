# Ivea Order Tracking Platform

## Overview

The Ivea Order Tracking Platform is a production-ready, bilingual (Arabic/English) web application designed for tracking custom interior decor orders. It manages the entire order lifecycle, from material procurement to installation, offering two distinct interfaces: a premium Customer Portal for order tracking via phone and order number, and a comprehensive Admin Dashboard for operations management. The platform integrates with external e-commerce systems and provides automated email notifications.

The project is fully functional, supporting Right-to-Left (RTL) layouts for Arabic, and includes a robust user management system, customizable order stages with icons, year-based order numbering, enhanced phone normalization, and complete media file upload/display capabilities.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework & Tooling:** React 18+ (TypeScript), Vite, Wouter for routing, TanStack Query for server state, React Hook Form with Zod for forms.
**UI/Design System:** Tailwind CSS with custom design tokens, Shadcn UI components for accessibility. Features a dual design language: minimal for customers, data-dense for admin. Supports light/dark mode and uses Inter and Playfair Display fonts.
**Component Architecture:** Separated customer and admin components, with reusable UI primitives and feature-specific components.

### Backend Architecture

**Runtime & Framework:** Node.js with Express.js (TypeScript), ES modules.
**API Design:** RESTful API with public (unauthenticated), admin (JWT-protected), and webhook endpoints. Uses JWT for authentication and bcrypt for password hashing.
**Business Logic:** Storage abstraction layer, pluggable email service (currently console-logged, designed for SendGrid/SES).

### Data Storage

**Database:** PostgreSQL (Neon-backed) via Drizzle ORM for type-safe queries and schema management.
**Object Storage:** Replit Object Storage (Google Cloud Storage) for media files, accessed via a secure proxy with ACLs and cache headers.
**Schema Design:** Includes Customers, Users (with role-based access), Orders (with `orderNumber` and `externalOrderId`), OrderStages (13-stage workflow), OrderEvents, MediaFiles, InstallationAppointments, and CustomerRatings.
**Data Flow:** Optimistic updates on frontend with TanStack Query, automatic cache invalidation, progress percentage based on completed stages.

### Authentication & Authorization

**Customer Authentication:** Phone number + order number verification (no persistent sessions), with phone normalization and combined field validation for security.
**Admin Authentication:** JWT tokens stored in localStorage, passed via Authorization header. Implements role-based access control (ADMIN, OPERATIONS, PRODUCTION, QUALITY, INSTALLATION, SUPPORT).

### Order Workflow

A 13-stage process (e.g., ORDER_RECEIVED, SITE_MEASUREMENT, PRODUCTION, QUALITY_CHECK, INSTALLATION, RATING) with detailed status transitions (PENDING, IN_PROGRESS, DONE). Progress percentage is calculated from completed stages. Email automation triggers at key milestones.

## External Dependencies

**Third-Party Services:**
- **Neon Database:** Serverless PostgreSQL hosting.
- **Replit Object Storage:** For media files.
- **Email Service:** Interface ready for production services like SendGrid/AWS SES.
- **E-commerce Platform:** Integrates via webhook endpoint `/api/webhooks/order-received`.

**Development Tools:**
- Replit-specific plugins (cartographer, dev banner).
- Drizzle Kit for database migrations.
- ESBuild for production bundling.

**Design Assets:**
- Custom fonts: Inter, Playfair Display.
- Lucide React icon library.