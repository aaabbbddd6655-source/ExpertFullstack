# Evia Order Tracking Platform - Design Guidelines

## Design Approach

**Dual-Interface Strategy**: This platform requires two distinct design languages:

**Customer Portal**: Reference-based approach inspired by premium order tracking experiences (Warby Parker, Tesla order tracking, luxury e-commerce). Focus on confidence-building, visual storytelling, and emotional engagement.

**Admin Dashboard**: System-based approach using refined utility patterns. Prioritize data density, quick scanning, and efficient task completion.

## Core Design Principles

1. **Premium Simplicity**: Clean layouts with generous whitespace conveying quality and craftsmanship
2. **Progress Transparency**: Visual hierarchy that makes order status immediately scannable
3. **Trust Through Detail**: Rich information presentation without overwhelming users
4. **Operational Efficiency**: Admin tools optimized for speed and accuracy

## Typography

**Font Stack**: 
- Primary: Inter or SF Pro Display (professional, excellent readability)
- Secondary: Georgia or Playfair Display (serif accents for premium touch on customer portal)

**Hierarchy**:
- Hero/Page Titles: text-4xl to text-5xl, font-semibold
- Section Headers: text-2xl to text-3xl, font-semibold
- Card Titles: text-lg to text-xl, font-medium
- Body Text: text-base, font-normal
- Captions/Metadata: text-sm, font-normal, reduced opacity

## Layout System

**Spacing Units**: Consistent use of Tailwind's 4, 6, 8, 12, 16, 24 units (p-4, gap-6, mb-8, etc.)

**Grid Structure**:
- Customer Portal: max-w-4xl centered containers, single-column focus
- Admin Dashboard: max-w-7xl, multi-column layouts with sidebar navigation

## Customer Portal Components

### Order Lookup Page
- Centered card design (max-w-md)
- Large input fields with clear labels above
- Prominent CTA button (full width on mobile, fixed width on desktop)
- Minimal background with subtle texture or gradient

### Order Tracking Page

**Hero Section**:
- Order number and status prominently displayed
- Large progress indicator (circular or linear bar, 0-100%)
- Customer name and order date as supporting info
- Background: Soft gradient or lifestyle image of interior space (blurred, elegant)

**Progress Timeline**:
- Vertical timeline on desktop, horizontal scroll on mobile
- Each stage as a card with:
  - Icon/illustration representing stage
  - Stage name (text-lg font-semibold)
  - Status badge (Pending/In Progress/Done with distinct styling)
  - Date/timestamp when completed
  - Expandable notes section
  - Media thumbnails in a masonry grid when present
- Active stage: Emphasized with stronger border, slight elevation
- Completed stages: Checkmark icon, muted styling
- Future stages: Dotted connection line, lighter opacity

**Stage Visual Treatment**:
- Cards with rounded corners (rounded-lg)
- Subtle shadow (shadow-sm) for pending, stronger (shadow-md) for active
- Connecting lines between stages (2px vertical line on desktop)

**Rating Section** (when applicable):
- Large star rating input (interactive, hover states)
- Textarea for comments (min-h-32)
- Centered layout with generous padding

### Media Gallery
- 2-3 column grid (grid-cols-2 md:grid-cols-3)
- Lightbox interaction for full-size view
- Document previews with file type icons

## Admin Dashboard Components

### Login Page
- Centered form (max-w-sm)
- Clean, minimal design
- "Evia Operations" branding

### Navigation
- Sidebar navigation (w-64, fixed on desktop)
- Grouped menu items: Orders, Customers, Reports, Settings
- Collapsible on mobile (hamburger menu)

### Orders Overview
- Data table with fixed header
- Columns: Order #, Customer, Phone, Status, Stage, Progress, Date
- Sortable headers (click to sort)
- Filter panel: Dropdown selects for status, stage; date range picker
- Status badges: Compact pills with appropriate styling
- Pagination controls at bottom

### Order Details Page
- Two-column layout (2/3 main content, 1/3 sidebar)
- Main: Timeline, events, media gallery
- Sidebar: Quick actions, appointment form, customer info card
- Stage management: Dropdown to change status + notes textarea + Save button
- Timeline events: Chronological list with timestamps, icons, and user attribution

### Forms & Inputs
- Labels above inputs (font-medium, text-sm)
- Input fields: rounded-md, border, px-4 py-2
- Buttons: Primary (solid), Secondary (outline), Danger (red for cancellations)
- Date/time pickers: Native or clean custom implementation

## Component Library

**Cards**: rounded-lg, shadow-sm, p-6, white background  
**Badges**: rounded-full, px-3 py-1, text-xs font-medium  
**Progress Bars**: h-2 rounded-full, smooth transitions  
**Buttons**: rounded-md, px-6 py-3, font-medium, hover:opacity-90  
**Inputs**: rounded-md, border, px-4 py-2, focus:ring-2  
**Tables**: Striped rows, hover states, compact padding  
**Modals**: Centered overlay, max-w-2xl, rounded-lg, shadow-xl  

## Images

**Customer Portal**:
- Hero section background: Elegant interior space (curtains, modern room, soft lighting) - full-width, subtle overlay for text readability
- Stage illustrations: Optional small icons/illustrations for each stage (can use icon library)

**Admin Dashboard**:
- No decorative images needed
- Focus on data visualization and functional elements

## Responsive Behavior

- Customer Portal: Mobile-first, single column stack, full-width progress bar
- Admin Dashboard: Desktop-optimized, collapsible sidebar on tablet/mobile, horizontal scroll for tables when needed
- Breakpoints: sm (640px), md (768px), lg (1024px), xl (1280px)