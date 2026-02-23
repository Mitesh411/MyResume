## 2024-05-22 - Missing Image Dimensions and Lazy Loading

**Learning:** Images without explicit `width` and `height` attributes cause Cumulative Layout Shift (CLS), negatively impacting Core Web Vitals. Additionally, loading all images eagerly, especially those below the fold, slows down the initial page load.

**Action:** Always add `width`, `height`, and `loading="lazy"` attributes to `<img>` tags. Use `loading="lazy"` for images that are not in the initial viewport. This allows the browser to allocate space for the image before it loads, preventing layout shifts, and defers loading of off-screen images until they are needed.
