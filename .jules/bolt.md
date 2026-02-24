## 2025-06-28 - LCP and Lazy Loading
**Learning:** Adding `loading="lazy"` to the profile image (`index.html`) and the first swiper image (`portfolio-details.html`) negatively impacts Largest Contentful Paint (LCP) as these are above the fold.
**Action:** Always exclude LCP candidates from lazy loading. For this template, explicitly keep `profile-img.jpg` and `portfolio-details-1.jpg` (first slider image) eager loaded.

## 2025-06-28 - Playwright & Swiper.js Strict Mode
**Learning:** Swiper.js duplicates slides for infinite looping, causing Playwright strict mode errors when targeting elements by class/id inside the slider.
**Action:** Use `.first()` or specific locators (e.g., `nth=0`) when verifying content inside Swiper containers to target the visible instance.
