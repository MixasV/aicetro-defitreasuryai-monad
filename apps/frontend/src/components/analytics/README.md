# Analytics Components

## Yandex.Metrika Integration

### Overview

Yandex.Metrika tracking integrated into AIcetro for user analytics.

**Counter ID:** 104604562

### Features Enabled

- ✅ **SSR Support** - Server-side rendering compatible
- ✅ **WebVisor** - Session replay & heatmaps
- ✅ **Clickmap** - Click tracking visualization
- ✅ **Ecommerce** - Transaction tracking (dataLayer)
- ✅ **Accurate Bounce Rate** - Improved bounce detection
- ✅ **Link Tracking** - External link clicks

### Implementation

Counter is automatically loaded on **all pages** via `layout.tsx`:

```tsx
// apps/frontend/src/app/layout.tsx
import { YandexMetrika } from '@/components/analytics/YandexMetrika';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <YandexMetrika />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
```

### Usage

#### 1. Track Goals (Conversions)

```tsx
import { trackGoal, GOALS } from '@/lib/yandex-metrika';

// Track wallet connection
function handleWalletConnect() {
  trackGoal(GOALS.WALLET_CONNECTED, {
    walletType: 'MetaMask',
    network: 'monad-testnet'
  });
}

// Track mode selection
function handleModeSelect(mode: 'simple' | 'corporate') {
  trackGoal(GOALS.MODE_SELECTED, { mode });
}

// Track delegation creation
function handleDelegationCreate(amount: number) {
  trackGoal(GOALS.DELEGATION_CREATED, {
    dailyLimit: amount,
    mode: 'simple'
  });
}
```

#### 2. Track Page Views (Manual)

```tsx
import { trackPageView } from '@/lib/yandex-metrika';

// Usually automatic, but can be called manually
useEffect(() => {
  trackPageView(window.location.pathname);
}, []);
```

#### 3. Track User Parameters

```tsx
import { trackUserParams } from '@/lib/yandex-metrika';

// Set user properties
trackUserParams({
  userType: 'premium',
  walletConnected: true,
  delegationActive: true
});
```

#### 4. Track External Links

```tsx
import { trackExternalLink } from '@/lib/yandex-metrika';

<a 
  href="https://github.com/AIcetro"
  onClick={() => trackExternalLink('https://github.com/AIcetro')}
>
  GitHub
</a>
```

#### 5. Track File Downloads

```tsx
import { trackFileDownload } from '@/lib/yandex-metrika';

<a 
  href="/whitepaper.pdf"
  onClick={() => trackFileDownload('/whitepaper.pdf')}
>
  Download Whitepaper
</a>
```

### Predefined Goals

```typescript
// Available in @/lib/yandex-metrika

GOALS = {
  // Onboarding
  WALLET_CONNECTED: 'wallet_connected',
  MODE_SELECTED: 'mode_selected',
  SIMPLE_SETUP_STARTED: 'simple_setup_started',
  CORPORATE_SETUP_STARTED: 'corporate_setup_started',
  
  // Delegation
  DELEGATION_CREATED: 'delegation_created',
  DELEGATION_REVOKED: 'delegation_revoked',
  
  // Dashboard
  DASHBOARD_VIEWED: 'dashboard_viewed',
  TRANSACTION_EXECUTED: 'transaction_executed',
  
  // Documentation
  DOCS_VIEWED: 'docs_viewed',
  FAQ_VIEWED: 'faq_viewed',
  
  // Social
  TWITTER_CLICKED: 'twitter_clicked',
  GITHUB_CLICKED: 'github_clicked',
  CREATOR_CLICKED: 'creator_clicked',
}
```

### Example: Track Onboarding Flow

```tsx
// pages/onboarding/page.tsx
import { trackGoal, GOALS } from '@/lib/yandex-metrika';

export default function OnboardingPage() {
  const handleSimpleSelect = () => {
    trackGoal(GOALS.SIMPLE_SETUP_STARTED, {
      source: 'onboarding_page',
      timestamp: Date.now()
    });
    router.push('/setup/simple');
  };

  const handleCorporateSelect = () => {
    trackGoal(GOALS.CORPORATE_SETUP_STARTED, {
      source: 'onboarding_page',
      timestamp: Date.now()
    });
    router.push('/wizard');
  };

  return (
    <div>
      <button onClick={handleSimpleSelect}>
        Simple Mode
      </button>
      <button onClick={handleCorporateSelect}>
        Corporate Mode
      </button>
    </div>
  );
}
```

### Yandex.Metrika Dashboard

Access analytics at: https://metrika.yandex.ru/dashboard?id=104604562

**Features:**
- Real-time visitor tracking
- Session recordings (WebVisor)
- Click heatmaps
- Conversion funnels
- Traffic sources
- Device & browser stats
- Geographic data

### Privacy Considerations

Yandex.Metrika complies with:
- ✅ No personal data collected without consent
- ✅ IP anonymization available
- ✅ Cookie consent integration ready
- ✅ GDPR compliant (with proper configuration)

### Testing

**Development:**
Counter works in development, but filter your IP in Metrika settings.

**Check Installation:**
1. Open browser console
2. Type: `ym`
3. Should see function (not undefined)
4. Check Network tab for `mc.yandex.ru` requests

**Verify Tracking:**
```javascript
// In browser console
ym(104604562, 'reachGoal', 'test_goal');
// Check Metrika dashboard for "test_goal" event
```

### Performance

**Load Strategy:** `afterInteractive`
- Loads after page becomes interactive
- Non-blocking (async)
- ~15KB gzipped script
- Cached by browser

**Impact:**
- Minimal (<50ms) on page load
- No blocking of critical resources
- Lazy initialization

### Troubleshooting

**Counter not working:**
1. Check browser console for errors
2. Verify `window.ym` exists
3. Check Network tab for blocked requests
4. Disable ad blockers (they block Metrika)

**Goals not tracking:**
1. Verify goal name matches dashboard
2. Check goal is created in Metrika settings
3. Wait 15-30 minutes for data to appear
4. Use real-time reports for immediate feedback

### Next Steps

**Set Up in Metrika:**
1. Go to [Metrika Dashboard](https://metrika.yandex.ru/dashboard?id=104604562)
2. Settings → Goals → Add goals from `GOALS` constants
3. Settings → Filters → Add IP filter (exclude team IPs)
4. Settings → Notifications → Set up alerts

**Recommended Goals to Create:**
- `wallet_connected` (conversion)
- `delegation_created` (conversion)
- `mode_selected` (engagement)
- `dashboard_viewed` (engagement)

---

**Created:** 2025-01-11  
**Counter ID:** 104604562  
**Version:** 1.0.0
