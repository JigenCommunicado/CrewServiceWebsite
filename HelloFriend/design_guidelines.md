# CrewLife Admin Panel - Design Guidelines

## Design Approach

**Selected Framework:** Material Design 3 + Ant Design principles for data-heavy admin applications

**Justification:** Admin dashboards require clarity, efficiency, and established UI patterns that users recognize. This hybrid approach combines Material Design's visual language with Ant Design's enterprise-focused components for optimal data presentation and workflow efficiency.

**Core Principles:**
- **Clarity First:** Information hierarchy over decoration
- **Efficiency:** Minimize clicks, maximize visibility
- **Consistency:** Predictable patterns across all admin functions
- **Data Focus:** Visualizations and tables are heroes, not afterthoughts

---

## Color Palette

### Dark Mode (Primary)
**Background Layers:**
- Base: `222 47% 11%` (near-black with slight warmth)
- Surface: `222 47% 15%` (elevated cards/panels)
- Elevated: `222 40% 18%` (modals, dropdowns)

**Brand/Primary:**
- Primary: `217 91% 60%` (professional blue for actions)
- Primary Hover: `217 91% 55%`

**Semantic Colors:**
- Success: `142 76% 36%`
- Warning: `38 92% 50%`
- Error: `0 84% 60%`
- Info: `199 89% 48%`

**Text:**
- Primary: `210 40% 98%`
- Secondary: `215 20% 65%`
- Disabled: `215 15% 45%`

### Light Mode
**Background:**
- Base: `0 0% 98%`
- Surface: `0 0% 100%`
- Elevated: `0 0% 100%`

**Text:**
- Primary: `222 47% 11%`
- Secondary: `215 16% 47%`
- Disabled: `215 14% 65%`

---

## Typography

**Font Stack:**
- Primary: 'Inter' from Google Fonts (CDN)
- Monospace: 'JetBrains Mono' for code/data (CDN)

**Scale:**
- Dashboard Headers: `text-3xl font-bold` (30px)
- Section Titles: `text-xl font-semibold` (20px)
- Card Titles: `text-lg font-medium` (18px)
- Body: `text-base` (16px)
- Captions/Labels: `text-sm` (14px)
- Data Tables: `text-sm font-mono` (14px monospace)

---

## Layout System

**Spacing Primitives:** Use Tailwind units of **2, 4, 6, 8** for consistency
- Micro spacing: `p-2`, `gap-2` (buttons, icons)
- Component spacing: `p-4`, `gap-4` (cards, forms)
- Section spacing: `p-6`, `gap-6` (between sections)
- Layout spacing: `p-8`, `gap-8` (page margins)

**Grid System:**
- Dashboard: `grid-cols-1 md:grid-cols-2 xl:grid-cols-4` (responsive metric cards)
- Main Content: `grid grid-cols-12` (flexible 12-column for complex layouts)
- Data Tables: Full width containers with `overflow-x-auto`

**Container Max-widths:**
- Full dashboard: `max-w-screen-2xl mx-auto`
- Forms/Settings: `max-w-4xl`
- Modals: `max-w-2xl`

---

## Component Library

### Navigation
**Sidebar (Primary Navigation):**
- Fixed left sidebar: `w-64` width, full height
- Collapsed state: `w-16` (icons only)
- Dark surface with hover states: `hover:bg-surface`
- Active state: left border accent `border-l-4 border-primary`
- Icons: Heroicons (CDN), `w-5 h-5` size

**Top Bar:**
- Height: `h-16`
- Contains: breadcrumbs, search, notifications, user profile
- Sticky: `sticky top-0 z-50`
- Shadow on scroll: `shadow-md`

### Dashboard Cards
**Metric Cards:**
- Background: `bg-surface`
- Border: `border border-white/10` (dark) or `border-gray-200` (light)
- Padding: `p-6`
- Rounded: `rounded-lg`
- Structure: Icon + Label + Large Value + Trend indicator
- Trend arrows: Up (green), Down (red) with percentage

**Chart Cards:**
- Same styling as metric cards
- Min height: `min-h-[320px]` for charts
- Use Chart.js or Recharts for visualizations
- Chart types: Line (trends), Bar (comparisons), Donut (distributions)

### Data Tables
**Structure:**
- Sticky header: `sticky top-0 bg-surface z-10`
- Alternating rows: `even:bg-surface/50`
- Hover state: `hover:bg-primary/5`
- Borders: `border-b border-white/10`
- Cell padding: `px-4 py-3`
- Actions column: Right-aligned with icon buttons

**Features:**
- Search bar above table
- Column sorting indicators (arrows)
- Pagination footer: `py-4` with page numbers and "rows per page" selector
- Bulk selection: Checkboxes in first column

### Forms
**Input Fields:**
- Background: `bg-surface` with `border border-white/20`
- Focused: `ring-2 ring-primary`
- Height: `h-10` for inputs, `h-40` for textareas
- Padding: `px-4 py-2`
- Labels: `text-sm font-medium mb-2` above fields
- Error state: `border-error text-error`

**Buttons:**
- Primary: `bg-primary text-white px-6 py-2.5 rounded-md`
- Secondary: `bg-surface border border-white/20`
- Danger: `bg-error text-white`
- Icon-only: `p-2 rounded-md` (square)
- Disabled: `opacity-50 cursor-not-allowed`

### System Monitoring
**Real-time Metrics:**
- Live update badge: Pulsing dot `animate-pulse` in top-right
- Progress bars: `h-2 rounded-full bg-surface` with colored fill
- Status indicators: Colored dots (green=healthy, yellow=warning, red=critical)
- CPU/Memory gauges: Semi-circle progress indicators

**Log Viewer:**
- Monospace font: `font-mono text-sm`
- Dark terminal-style: `bg-black/40 p-4 rounded`
- Color-coded log levels: INFO (blue), WARN (yellow), ERROR (red)
- Auto-scroll toggle
- Export button: Download logs as .txt

### Modals & Overlays
**Modal:**
- Backdrop: `bg-black/50 backdrop-blur-sm`
- Container: `bg-surface max-w-2xl rounded-lg p-6`
- Header: `text-xl font-semibold mb-4` with close button
- Footer: Action buttons aligned right

**Notifications/Toasts:**
- Position: `fixed top-4 right-4 z-50`
- Width: `w-96`
- Auto-dismiss: 5 seconds
- Types: Success (green), Error (red), Info (blue), Warning (yellow)
- Icon + message + close button

---

## Animations

**Use Sparingly:**
- Page transitions: None (instant navigation for speed)
- Hover states: `transition-colors duration-150`
- Drawer/sidebar toggle: `transition-all duration-300`
- Chart animations: Built-in library defaults only
- Loading spinners: Simple rotating circle, no elaborate animations

---

## Images

**Placement:**
- **No hero images** - admin panels prioritize immediate access to data
- **User avatars:** Small circles `w-10 h-10 rounded-full` in tables/profiles
- **Empty states:** Simple illustration placeholders (use SVG icon libraries)
- **Logo:** Top-left of sidebar, `h-8` height

**Icons:**
- **Library:** Heroicons (solid for active/filled states, outline for default)
- **Usage:** Navigation icons, action buttons, status indicators, metric cards
- **Sizes:** `w-4 h-4` (inline), `w-5 h-5` (standard), `w-8 h-8` (feature icons)

---

## Responsive Strategy

**Breakpoints:**
- Mobile: `<768px` - Sidebar hidden, hamburger menu, stacked cards
- Tablet: `768px-1280px` - Collapsible sidebar, 2-column dashboards
- Desktop: `>1280px` - Full sidebar, 4-column dashboards, optimal layout

**Mobile Adaptations:**
- Tables: Horizontal scroll with `overflow-x-auto`
- Metric cards: Stack vertically
- Sidebar: Off-canvas drawer triggered by hamburger
- Top bar: Compressed with hidden breadcrumbs