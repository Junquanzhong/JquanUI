# Guanlan Console Core Pages Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Expand the Guanlan Console visual system from one dashboard preview into a coherent set of B-end core pages centered on the `gl-screen` canvas.

**Architecture:** Keep each page as a static HTML entry point that loads the shared JquanUI theme config and Core runtime. Reuse the existing atomic-class shortcuts for the frame, panels, cards, navigation, filters, data rows, forms, and auth surfaces. Keep the outside page shell intentionally minimal so the `gl-screen` section remains the product canvas.

**Tech Stack:** HTML, JquanUI Core 4.70.0, Phosphor icons, native form/table semantics, JquanUI extraction doctor.

---

### Task 1: Establish the page matrix and verification contract

**Files:**
- Modify: `projects/guanlan-console/README.md`
- Modify: `projects/guanlan-console/style-extraction/visual-style-guide.md`
- Create: `projects/guanlan-console/GATES.md`
- Create: `scripts/verify-guanlan-pages.cjs`

**Step 1:** Document the page matrix and navigation relationships.

**Step 2:** Add a repository-owned checker that verifies all page entries, required `gl-screen` usage, no inline styles, and required auth/form/table landmarks.

**Step 3:** Run the checker and record the expected marker.

### Task 2: Build the home analytics page

**Files:**
- Modify: `projects/guanlan-console/pages/dashboard-preview.html`
- Create: `projects/guanlan-console/pages/home.html`

**Step 1:** Remove the external presentation title and keep the screen as the primary canvas.

**Step 2:** Add the home workspace layout: navigation, greeting, KPI strip, trend chart, region coverage panel, activity feed, and quick actions.

**Step 3:** Verify the home page through the JquanUI extractor.

### Task 3: Build operational list and detail pages

**Files:**
- Create: `projects/guanlan-console/pages/list.html`
- Create: `projects/guanlan-console/pages/detail.html`

**Step 1:** Add a semantic table page for articles/products with query controls, filter chips, status tags, row actions, and pagination.

**Step 2:** Add a detail page with record identity, KPI summary, progress/coverage, activity timeline, and next actions.

**Step 3:** Verify both pages through the page checker and JquanUI extractor.

### Task 4: Build form and configuration pages

**Files:**
- Create: `projects/guanlan-console/pages/form.html`
- Create: `projects/guanlan-console/pages/settings.html`

**Step 1:** Add a content/product editor with labelled fields, icon-led sections, validation-ready native inputs, preview panel, and sticky action bar.

**Step 2:** Add a configuration center with tabs, toggles, select controls, permission groups, and save-state feedback.

**Step 3:** Verify semantic form landmarks and no inline styles.

### Task 5: Build authentication pages

**Files:**
- Create: `projects/guanlan-console/pages/login.html`
- Create: `projects/guanlan-console/pages/signup.html`

**Step 1:** Add login and signup surfaces using the same canvas language but with a calmer two-column auth composition.

**Step 2:** Include labels, password fields, remember/terms controls, recovery links, and accessible button names.

**Step 3:** Verify both pages through the page checker and JquanUI extractor.

### Task 6: Run integration and visual checks

**Files:**
- Modify: `projects/guanlan-console/jquan.config.cjs`
- Modify: `projects/guanlan-console/design-system/tokens/guanlan-jquan.config.js`
- Modify: `projects/guanlan-console/design-system/tokens/guanlan.tokens.json`

**Step 1:** Run the static page checker.

**Step 2:** Run JquanUI Doctor against the page directory with the Guanlan config.

**Step 3:** Open the home, list, form, settings, and login entries in the local browser and check that the main canvas renders without console errors or horizontal overflow.

