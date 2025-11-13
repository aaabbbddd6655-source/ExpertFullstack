# Evia Order Tracking Platform

A production-ready web application for tracking custom interior decor orders from raw materials through production, quality check, delivery, and installation. Features a premium customer-facing portal and comprehensive admin dashboard for operations management.

## Features

### Customer Portal
- **Order Lookup**: Customers can track orders using phone number + order number
- **Real-time Progress**: Visual timeline showing all 13 stages from order to completion
- **Stage Details**: View status, dates, notes, and media for each stage
- **Rating System**: 5-star rating with comments after installation completion
- **Premium UI**: Clean, minimal design perfect for luxury interior decor brand

### Admin Dashboard
- **Order Management**: View, filter, and search all orders
- **Stage Control**: Update stage status, add notes, and manage timelines
- **Appointment Scheduling**: Schedule and manage installation appointments
- **Media Management**: Add photos and documents to orders and stages
- **Email Automation**: Automated email notifications at key milestones
- **Multi-user Support**: Role-based access (Admin, Operations, Production, Quality, Installation, Support)

### Integration
- **Webhook Endpoints**: Accept orders from external e-commerce platform
- **Internal Updates**: Webhook for internal systems to update order status
- **Email Service**: Pluggable email service (console-logged for MVP, ready for SendGrid/SES)

## Tech Stack

### Frontend
- **React** with TypeScript
- **Tailwind CSS** + **Shadcn UI** for premium components
- **Wouter** for routing
- **TanStack Query** for data fetching and caching
- **React Hook Form** with Zod validation

### Backend
- **Node.js** with **Express**
- **TypeScript** for type safety
- **Drizzle ORM** for database management
- **PostgreSQL** (Neon-backed) for data persistence
- **JWT** for authentication
- **bcrypt** for password hashing

## Getting Started

### Prerequisites
- Node.js 18+ installed
- PostgreSQL database (automatically configured in Replit)

### Installation

1. Install dependencies:
```bash
npm install
```

2. Push database schema:
```bash
npm run db:push
```

3. Seed the database with sample data:
```bash
tsx server/seed.ts
```

### Running the Application

Start the development server:
```bash
npm run dev
```

The application will be available at:
- **Customer Portal**: http://localhost:5000/
- **Admin Dashboard**: http://localhost:5000/admin

### Default Admin Credentials
```
Email: admin@evia.com
Password: admin123
```

### Sample Customer Data
Use these credentials to test the customer portal:
```
Phone: +15551234567
Order Number: EV-2024-0123

Phone: +15552345678
Order Number: EV-2024-0124

Phone: +15553456789
Order Number: EV-2024-0125
```

## Database Schema

### Core Entities

#### Customers
- `id`: UUID primary key
- `fullName`: Customer name
- `phone`: Phone number (unique, used for order lookup)
- `email`: Email address (optional)

#### Orders
- `id`: UUID primary key
- `externalOrderId`: Order number from e-commerce system (unique)
- `customerId`: Foreign key to customers
- `totalAmount`: Order total in cents
- `status`: Enum (PENDING_MEASUREMENT, DESIGN_APPROVAL, IN_PRODUCTION, etc.)
- `progressPercent`: 0-100 showing overall completion
- `currentStageId`: Foreign key to current order stage
- `createdAt`, `updatedAt`: Timestamps

#### OrderStages
13 stages tracking the order lifecycle:
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

Each stage has:
- `status`: PENDING, IN_PROGRESS, or DONE
- `startedAt`, `completedAt`: Timestamps
- `notes`: Optional text notes

#### Additional Entities
- **OrderEvents**: Audit trail of all changes
- **MediaFiles**: Photos and documents attached to orders/stages
- **InstallationAppointments**: Scheduled installation times
- **CustomerRatings**: Post-installation feedback
- **Users**: Admin staff accounts with roles

## API Documentation

### Public Endpoints (Customer Portal)

#### POST /api/public/order-lookup
Look up an order by phone and order number.

**Request:**
```json
{
  "phone": "+15551234567",
  "orderNumber": "EV-2024-0123"
}
```

**Response:**
```json
{
  "order": { ... },
  "customer": { ... },
  "stages": [ ... ],
  "media": [ ... ],
  "appointment": { ... },
  "rating": { ... }
}
```

#### POST /api/public/orders/:orderId/rating
Submit a customer rating.

**Request:**
```json
{
  "rating": 5,
  "comment": "Excellent service and beautiful results!"
}
```

### Webhook Endpoints (Integration)

#### POST /api/webhooks/store-order-created
Called when a new order is placed in the e-commerce system.

**Request:**
```json
{
  "externalOrderId": "EV-2024-0150",
  "customer": {
    "name": "Jane Smith",
    "email": "jane@example.com"
  },
  "totalAmount": 4500,
  "items": [
    {
      "name": "Custom Curtains",
      "quantity": 2,
      "price": 2250
    }
  ],
  "phone": "+15559876543"
}
```

**Response:**
```json
{
  "order": { ... },
  "stages": [ ... ]
}
```

**Actions:**
- Creates or finds customer by phone
- Creates order with initial status
- Creates all 13 stages (first one marked DONE)
- Sends "Order Received" email to customer

#### POST /api/webhooks/internal-status-update
Called by internal operations system to update order status.

**Request:**
```json
{
  "externalOrderId": "EV-2024-0123",
  "stageType": "PRODUCTION_CUTTING",
  "status": "DONE",
  "notes": "Cutting completed successfully",
  "progressPercent": 45
}
```

**Actions:**
- Updates specified stage
- Updates order progress
- Creates audit event
- May trigger automated emails

### Admin Endpoints (Requires Authentication)

All admin endpoints require JWT token in Authorization header:
```
Authorization: Bearer <token>
```

#### POST /api/admin/login
Authenticate admin user.

**Request:**
```json
{
  "email": "admin@evia.com",
  "password": "admin123"
}
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "...",
    "name": "Admin User",
    "email": "admin@evia.com",
    "role": "ADMIN"
  }
}
```

#### GET /api/admin/orders
Get all orders with optional filters.

**Query Parameters:**
- `status`: Filter by order status
- `stageType`: Filter by current stage
- `fromDate`: Start date (ISO format)
- `toDate`: End date (ISO format)

#### GET /api/admin/orders/:id
Get full order details including stages, events, media, appointment, and rating.

#### PATCH /api/admin/orders/:id/status
Update order status and progress.

**Request:**
```json
{
  "status": "READY_FOR_INSTALL",
  "progressPercent": 85
}
```

#### PATCH /api/admin/orders/:id/stages/:stageId
Update a specific stage.

**Request:**
```json
{
  "status": "DONE",
  "notes": "Quality check passed - ready for packaging"
}
```

**Actions:**
- Updates stage status
- Sets timestamps (startedAt, completedAt)
- Creates audit event
- May trigger email (for DESIGN_APPROVAL, READY_FOR_INSTALL, INSTALLED)

#### POST /api/admin/orders/:id/media
Add media to an order.

**Request:**
```json
{
  "url": "https://storage.example.com/image.jpg",
  "type": "IMAGE",
  "stageId": "stage-uuid" // optional
}
```

#### POST /api/admin/orders/:id/appointment
Create or update installation appointment.

**Request:**
```json
{
  "scheduledAt": "2024-02-15T14:00:00Z",
  "locationAddress": "123 Main St, City, State 12345",
  "notes": "Customer prefers afternoon installation"
}
```

**Actions:**
- Creates or updates appointment
- Creates audit event
- Sends installation scheduled email to customer

## Email Automation

The platform automatically sends emails at key milestones:

1. **Order Received**: When new order is created via webhook
2. **Design Ready**: When DESIGN_APPROVAL stage is started (customer needs to review/approve)
3. **Ready for Installation**: When READY_FOR_INSTALL stage is reached (customer needs to confirm date)
4. **Installation Complete**: When INSTALLED stage is marked done (requests rating)

### Current Implementation
Emails are console-logged for the MVP. See `server/services/email.ts` for the email service interface.

### Production Setup
To use a real email provider:

1. Install email provider SDK (e.g., `@sendgrid/mail`)
2. Implement a new class following the `EmailService` interface
3. Update `server/services/email.ts` to export your implementation
4. Add API keys to environment variables

## Environment Variables

Required environment variables:

```env
# Database (automatically configured in Replit)
DATABASE_URL=postgresql://...
PGHOST=...
PGPORT=5432
PGUSER=...
PGPASSWORD=...
PGDATABASE=...

# Authentication
SESSION_SECRET=your-secret-key-here
```

## Project Structure

```
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── pages/         # Page components
│   │   ├── lib/           # Utilities and API client
│   │   ├── hooks/         # Custom React hooks
│   │   └── App.tsx        # Main application component
│   └── index.html
│
├── server/                # Backend Express application
│   ├── services/          # Business logic services
│   ├── index.ts           # Server entry point
│   ├── routes.ts          # API route handlers
│   ├── storage.ts         # Database access layer
│   └── seed.ts            # Database seeding script
│
├── shared/                # Shared code between frontend and backend
│   └── schema.ts          # Database schema and types
│
└── README.md
```

## Development Workflow

### Adding a New Admin User
```typescript
tsx server/seed.ts
// Or manually in code:
const passwordHash = await bcrypt.hash("password", 10);
await storage.createUser({
  name: "Staff Member",
  email: "staff@evia.com",
  passwordHash,
  role: "OPERATIONS" // or PRODUCTION, QUALITY, INSTALLATION, SUPPORT
});
```

### Testing Webhooks
You can test webhook endpoints using curl:

```bash
# Create a new order
curl -X POST http://localhost:5000/api/webhooks/store-order-created \
  -H "Content-Type: application/json" \
  -d '{
    "externalOrderId": "EV-2024-0150",
    "customer": {"name": "Test Customer"},
    "totalAmount": 3000,
    "items": [],
    "phone": "+15559999999"
  }'

# Update order stage
curl -X POST http://localhost:5000/api/webhooks/internal-status-update \
  -H "Content-Type: application/json" \
  -d '{
    "externalOrderId": "EV-2024-0150",
    "stageType": "SITE_MEASUREMENT",
    "status": "IN_PROGRESS",
    "notes": "Scheduled for tomorrow"
  }'
```

## Security Considerations

### Production Checklist
- [ ] Change `SESSION_SECRET` to a strong random value
- [ ] Use HTTPS in production
- [ ] Implement rate limiting on auth endpoints
- [ ] Add CORS configuration for your domain
- [ ] Use environment-specific database credentials
- [ ] Implement proper error logging
- [ ] Add request validation middleware
- [ ] Set up monitoring and alerts

## Future Enhancements

### Planned Features
- Real email integration (SendGrid/AWS SES)
- SMS notifications alongside email
- File upload for stage media with cloud storage
- Real OTP-based phone authentication
- Advanced analytics dashboard
- Role-based permission system
- Multi-language support
- Mobile app

## Support

For issues or questions:
- Check the API documentation above
- Review the database schema
- Examine the email service console logs
- Test with provided sample data

## License

Proprietary - Evia Interior Design Platform
