## 2025-06-28 - Images and Isotope Layout
**Learning:** Visual verification of pages using the Isotope library requires adding a delay or wait condition in automation scripts to allow the layout to settle after images load. Images should include explicit width and height attributes to prevent layout shifts (CLS) and use loading='lazy' for non-critical images. This is critical for the Isotope layout library to function correctly with lazy loading.
**Action:** When adding lazy loading to images in Isotope grids, always ensure explicit width/height attributes are present to reserve space.
