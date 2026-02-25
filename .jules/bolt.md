## 2025-05-19 - Image Optimization & LCP Trade-offs
**Learning:** While `loading="lazy"` is great for reducing initial payload, applying it blindly to the Largest Contentful Paint (LCP) element (like the first slide in a hero carousel) degrades performance.
**Action:** Always audit the LCP candidate. For carousels, the first image must be eager loaded, while subsequent slides should be lazy loaded. Also, explicit `width` and `height` are non-negotiable for CLS stability.
