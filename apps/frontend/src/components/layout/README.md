# Layout Components

## Footer Component

Responsive footer component for AIcetro platform.

### Features

- ✅ **Fully Responsive** - Desktop (4 columns) → Tablet (2 columns) → Mobile (1 column)
- ✅ **Dark Theme** - Matches AIcetro design system
- ✅ **Social Links** - Twitter/X, GitHub with hover effects
- ✅ **Navigation** - Product, Resources, Network status
- ✅ **Creator Credit** - Links to mixas.pro
- ✅ **Legal Pages** - Privacy Policy, Terms of Service

### Usage

```tsx
import { Footer } from '@/components/layout/Footer';

export default function Page() {
  return (
    <div>
      {/* Your page content */}
      
      <Footer />
    </div>
  );
}
```

### Design Tokens

**Colors:**
- Primary: #346ef0
- Background: bg-surface
- Borders: border-white/10
- Text: text-white, text-muted

**Breakpoints:**
- Mobile: < 768px (1 column)
- Tablet: 768px - 1024px (2 columns)
- Desktop: > 1024px (4 columns)

### Mobile Optimization

Footer automatically adapts to mobile:
- Stacks columns vertically
- Reduces spacing (py-12 → py-8)
- Touch-friendly social icons (10x10 → 44x44 touch target)
- Horizontal scroll for bottom links

### Sections

1. **Brand Section**
   - Logo + tagline
   - Social media links (Twitter, GitHub)

2. **Product Links**
   - Get Started
   - Setup Wizard
   - Dashboard
   - Simple Mode

3. **Resources Links**
   - Documentation
   - FAQ
   - GitHub
   - Mode Comparison

4. **Network Status**
   - Monad Testnet status
   - Beta version indicator
   - Creator credit (mixas.pro)

5. **Bottom Bar**
   - Copyright
   - Privacy Policy
   - Terms of Service
   - Open Source link

### Customization

To add new links:

```tsx
// In Product section:
<li>
  <Link href="/new-page" className="text-sm text-muted transition hover:text-white">
    New Feature
  </Link>
</li>
```

To change creator link:

```tsx
<a href="https://your-site.com" ...>
  <span>your-site.com</span>
</a>
```

### Accessibility

- Semantic HTML (`<footer>`, `<nav>`)
- ARIA labels for social icons
- Keyboard navigable
- Screen reader friendly
- High contrast text

### Performance

- No external dependencies
- Minimal CSS (Tailwind)
- No images (emoji icons)
- ~5KB gzipped

---

**Created:** 2025-01-11  
**Version:** 1.0.0  
**Maintainer:** AIcetro Team
