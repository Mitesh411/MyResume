## 2025-06-28 - Image Optimization & Layout Libraries
**Learning:** Layout libraries like Isotope require explicit image dimensions (width/height) to calculate layout correctly when lazy loading is used, otherwise they might calculate 0 height, causing overlaps or broken layouts.
**Action:** Always add width/height attributes to images used in grid layouts like Isotope.

**Learning:** Swiper.js duplicates DOM elements for loop functionality. Verification scripts using Playwright should target all instances or be specific about which one is visible.
**Action:** Verify all matching elements or use `.first` / `.nth(i)` carefully.

**Learning:** Lazy loading LCP candidates (like the first image in a hero slider) can hurt LCP metrics.
**Action:** Avoid `loading="lazy"` on above-the-fold images.
