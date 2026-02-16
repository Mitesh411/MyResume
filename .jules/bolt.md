## 2026-02-16 - Isotope Layout & Lazy Loading
**Learning:** Isotope layout library requires images to be loaded before calculating positions, or it overlaps items. However, adding explicit `width` and `height` attributes to the `<img>` tags allows the browser to reserve space before the image loads, enabling Isotope to calculate layout correctly even with `loading="lazy"`.
**Action:** Always verify that lazy-loaded images in Isotope grids have explicit dimensions to prevent layout shifts and broken grids.
