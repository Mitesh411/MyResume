/** Jest config: jsdom stands in for the browser; coverage is measured on the
 *  site's only script with logic, assets/js/main.js. */
module.exports = {
  testEnvironment: "jsdom",
  testMatch: ["<rootDir>/tests/**/*.test.js"],
  collectCoverageFrom: ["assets/js/main.js"],
  coverageDirectory: "coverage",
  coverageReporters: ["text", "text-summary", "html", "lcov"],
  coverageThreshold: {
    global: { statements: 95, branches: 90, functions: 95, lines: 95 },
  },
};
