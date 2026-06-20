## 2025-05-19 - Image Optimization & LCP Trade-offs
**Learning:** While `loading="lazy"` is great for reducing initial payload, applying it blindly to the Largest Contentful Paint (LCP) element (like the first slide in a hero carousel) degrades performance.
**Action:** Always audit the LCP candidate. For carousels, the first image must be eager loaded, while subsequent slides should be lazy loaded. Also, explicit `width` and `height` are non-negotiable for CLS stability.

## 2025-05-19 - CSP & Preload Synergy
**Learning:** A restrictive `default-src 'self'` CSP silently blocks performance optimizations like `preconnect` to external domains (e.g., Google Fonts). Always audit the console for CSP violations before assuming optimizations are working.
**Action:** When adding resource hints, verify that the CSP allows connections to those domains. Use `connect-src` and `font-src` explicitly.
