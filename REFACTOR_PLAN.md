# MatheuxMed Refactor Plan

**Status**: In Progress  
**Last Updated**: 2026-10-11  
**Branch**: `refactor/security-and-curriculum`

---

## Executive Summary

This document outlines a complete refactor of the MatheuxMed repository to:
1. **Fix security issues** (Firebase config exposure)
2. **Fix path issues** (absolute `/mathyxo/` paths → relative paths)
3. **Improve architecture** (monolithic HTML → data-driven structure)
4. **Prepare for Supabase integration** (user auth, progress tracking, curriculum management)
5. **Fill the Moroccan mathematics curriculum** with structured content

---

## Phase 1: Security & Path Fixes ✅ PLANNED

### Issue 1.1: Firebase Config Exposure
**File**: `js/auth.js` (lines 4-12)  
**Problem**: Public Firebase config is hardcoded in browser-accessible JavaScript.  
**Risk**: Exposes project ID and API key (low risk for public projects, but violates best practices).

**Solution**:
- [ ] Create `.env.example` with placeholder for public Supabase anon key
- [ ] Move Firebase config to environment variables
- [ ] Replace Firebase with Supabase client
- [ ] Ensure service role key NEVER reaches browser

### Issue 1.2: Absolute Path Dependencies
**Files affected**: 
- `index.html` (lines 7-9, 28-31, 33)
- `contact.html` (lines 7-8, 21-24)
- `premiere/index.html` (line 7, 22-23)
- `seconde/index.html` (line 7, 22-23)

**Problem**: All CSS/JS imports use `/mathyxo/` prefix, breaking on custom domains or different deployments.  
**Impact**: Site breaks if deployed anywhere except `domain.com/mathyxo/`.

**Solution**:
- [ ] Replace all `/mathyxo/` with relative paths (`./`, `../`)
- [ ] Test on GitHub Pages with repo subfolder
- [ ] Update deployment guide

### Issue 1.3: Hard-coded Alert Dialogs
**Files affected**: 
- `js/components.js` (lines 267, 351)

**Problem**: `alert()` dialogs are poor UX for educational platform.  
**Solution**:
- [ ] Create toast/modal component
- [ ] Replace all alerts with proper UI feedback

---

## Phase 2: Data-Driven Architecture ✅ PLANNED

### Issue 2.1: Monolithic Component Rendering
**File**: `js/components.js` (596 lines)  
**Problem**: All curriculum data is hardcoded in render functions; no separation of data from UI.

**Solution**:
- [ ] Extract all level/lesson definitions into `data/curriculum.js`
- [ ] Create data models for:
  - Level (id, name, icon, category, description)
  - Chapter (id, title, lessons)
  - Lesson (id, title, description, objectives, content)
  - Quiz (id, questions, answers)

### Issue 2.2: Duplicate Lesson Cards
**Files affected**: `premiere/index.html`, `seconde/index.html`

**Problem**: Lesson data is repeated in inline HTML strings.  
**Solution**:
- [ ] Move all lesson definitions to `data/curriculum.js`
- [ ] Single source of truth for lesson metadata
- [ ] Generate HTML from data

### Issue 2.3: Missing Lesson Pages
**Problem**: Links point to non-existent lesson HTML files.  
**Example**: `/mathyxo/premiere/polynomes.html` doesn't exist.

**Solution**:
- [ ] Create single `lesson-detail.html` template
- [ ] Use query params or URL routing to load lesson by ID
- [ ] Render from data/curriculum.js

---

## Phase 3: Curriculum Content Structure ✅ PLANNED

### Moroccan Education Levels

```
Primaire (6 years: P1-P6)
├── Numbers & Operations
├── Fractions
├── Geometry
├── Measurement
├── Logic & Problem Solving
└── Multiplication Tables

Collège (3 years: C1-C3)
├── Integers & Rationals
├── Powers
├── First Degree Equations
├── Linear Functions
├── Plane Geometry
├── Statistics
└── Basic Probability

Tronc Commun (1 year)
├── Affine & Quadratic Functions
├── Equations & Inequalities
├── Analytic Geometry
├── Vectors
├── Probability
└── Advanced Statistics

Bac Année 1 (First Year)
├── SE (Science Expérimentale)
├── SM (Science Mathématique)
└── SH (Sciences Humaines)

Bac Année 2 (Second Year)
├── PC (Physics-Chemistry)
├── SVT (Life Sciences)
├── SM (Math Specialty)
└── SH (Humanities Specialty)
```

### Content Model for Each Lesson

```javascript
{
  id: "lesson-001",
  level: "primaire-1",
  chapter: "numbers-operations",
  title: "Les Nombres de 1 à 10",
  slug: "nombres-1-10",
  duration: 15, // minutes
  difficulty: "easy",
  objectives: [
    "Recognize numbers 1-10",
    "Count objects",
    "Simple addition and subtraction"
  ],
  keyWords: ["numbers", "counting", "addition"],
  content: {
    introduction: "string",
    theory: "string",
    examples: [
      { problem: "string", solution: "string" }
    ],
    practice: [
      { question: "string", hint: "string", answer: "string" }
    ]
  },
  quiz: {
    questions: [
      { 
        type: "multiple-choice",
        question: "string",
        options: ["A", "B", "C", "D"],
        correct: 0
      }
    ],
    passingScore: 70
  },
  resources: [
    { type: "pdf", url: "...", title: "..." },
    { type: "video", url: "...", title: "..." }
  ]
}
```

---

## Phase 4: Supabase Integration ✅ PLANNED

### Tables to Create

```sql
-- Users (managed by Supabase Auth)
users (id, email, display_name, created_at)

-- Curriculum
levels (id, name, category, slug, order)
chapters (id, level_id, title, slug, order)
lessons (id, chapter_id, title, slug, content, duration, difficulty, objectives)
quiz_questions (id, lesson_id, question, type, options, correct_answer)

-- Progress Tracking
user_progress (id, user_id, lesson_id, completed_at, quiz_score)
user_badges (id, user_id, badge_name, earned_at)
user_stats (id, user_id, total_xp, current_level, streaks)
```

### Row Level Security (RLS)

```sql
-- Users can only see their own progress
CREATE POLICY "Users see own progress"
ON user_progress FOR SELECT
USING (auth.uid() = user_id);

-- Public can read curriculum
CREATE POLICY "Public read curriculum"
ON lessons FOR SELECT
USING (true);

-- Authenticated users can update their progress
CREATE POLICY "Users update own progress"
ON user_progress FOR UPDATE
USING (auth.uid() = user_id);
```

---

## Phase 5: File Structure Refactor ✅ PLANNED

### Current Structure
```
mathyxo/
├── index.html
├── contact.html
├── css/style.css
├── js/
│   ├── components.js (596 lines, monolithic)
│   ├── auth.js
│   └── i18n.js
├── premiere/index.html
├── seconde/index.html
├── terminale/index.html
├── student-dashboard/
└── auth/
```

### Proposed Structure
```
mathyxo/
├── README.md (detailed)
├── .env.example
├── index.html (landing page)
├── contact.html
├── lesson-detail.html (template for all lessons)
│
├── data/
│   ├── curriculum.json (all lesson definitions)
│   ├── curriculum.js (helper to load curriculum)
│   └── schema.md (data model documentation)
│
├── css/
│   ├── main.css (refactored from style.css)
│   ├── rtl.css (existing, no change)
│   ├── responsive.css (breakpoints)
│   ├── components.css (buttons, cards, modals)
│   └── language-switcher.css
│
├── js/
│   ├── app.js (main entry point)
│   ├── supabase-client.js (Supabase setup)
│   ├── auth.js (refactored for Supabase)
│   ├── curriculum.js (load & render lessons)
│   ├── gamification.js (XP, badges, levels)
│   ├── ui.js (toast, modal, notifications)
│   ├── i18n.js (existing, no change)
│   ├── language-switcher.js (existing, no change)
│   └── components.js (refactored UI components)
│
├── pages/
│   ├── levels/
│   │   ├── primaire.html
│   │   ├── college.html
│   │   ├── tronc-commun.html
│   │   └── bac.html
│   ├── student-dashboard.html
│   └── admin-dashboard.html (future)
│
├── docs/
│   ├── CURRICULUM.md (curriculum guide)
│   ├── DEPLOYMENT.md (GitHub Pages + Supabase)
│   ├── ARCHITECTURE.md (technical design)
│   └── API.md (Supabase API reference)
│
└── .github/
    └── workflows/
        └── deploy.yml (auto-deploy on push)
```

---

## Phase 6: Migration Tasks ⏳ IN QUEUE

### 6.1 Extract Curriculum Data
- [ ] Create `data/curriculum.json` with all levels/chapters/lessons
- [ ] Create `data/curriculum.js` to manage curriculum
- [ ] Move lesson content from inline HTML → structured data

### 6.2 Refactor Components
- [ ] Split `js/components.js` into smaller modules
- [ ] Create `js/ui.js` for toast, modal, notifications
- [ ] Create `js/gamification.js` for XP system
- [ ] Create `js/curriculum.js` to load and render lessons

### 6.3 Replace Paths
- [ ] Replace all `/mathyxo/` → `./`, `../`
- [ ] Update all import statements
- [ ] Test on GitHub Pages

### 6.4 Security Fixes
- [ ] Create `.env.example`
- [ ] Update `js/auth.js` to use Supabase
- [ ] Remove Firebase SDK
- [ ] Document environment variables

### 6.5 Update HTML Pages
- [ ] Simplify `index.html` (remove inline script logic)
- [ ] Create `lesson-detail.html` template
- [ ] Create `level-overview.html` template
- [ ] Update `contact.html` (remove absolute paths)

### 6.6 Add Documentation
- [ ] Write comprehensive README.md
- [ ] Add DEPLOYMENT.md (GitHub Pages setup)
- [ ] Add ARCHITECTURE.md (tech decisions)
- [ ] Add CURRICULUM.md (how to add lessons)

---

## Phase 7: Moroccan Curriculum Content ⏳ IN QUEUE

### Content to Add

#### Primaire (6 years)
Each level (P1-P6) gets:
- 4-5 chapters
- 3-4 lessons per chapter
- 2-3 practice exercises per lesson
- 1 quiz per lesson
- Example: **P1 Numbers & Operations**
  - Lesson 1: Numbers 1-10
  - Lesson 2: Basic Counting
  - Lesson 3: Simple Addition
  - Lesson 4: Simple Subtraction

#### Collège (3 years)
Each level (C1-C3) gets:
- 6-7 chapters
- 4-5 lessons per chapter
- Example: **C1 Integers**
  - Lesson 1: Positive & Negative Numbers
  - Lesson 2: Adding Integers
  - Lesson 3: Subtracting Integers
  - Lesson 4: Multiplying Integers
  - Lesson 5: Dividing Integers

#### Tronc Commun
- 6-7 chapters
- 5-6 lessons per chapter
- Example: **Functions**
  - Lesson 1: Function Basics
  - Lesson 2: Affine Functions
  - Lesson 3: Quadratic Functions
  - Lesson 4: Graphing Functions
  - Lesson 5: Transformations

#### Bac Years
Each specialty gets:
- 8-10 chapters
- 6-8 lessons per chapter
- Advanced content aligned with exam standards

---

## Quick Wins (Do First)

1. **Add README.md** (5 min)
   - Project description
   - Quick start
   - File structure
   - Deployment

2. **Create .env.example** (3 min)
   - Document environment variables
   - Add Supabase config template

3. **Fix All Paths** (30 min)
   - Replace `/mathyxo/` with `./`
   - Test locally
   - Commit to `refactor/security-and-curriculum`

4. **Create data/curriculum.json** (1-2 hours)
   - Start with Primaire level
   - 3-4 chapters, 10-15 lessons
   - Full structure with objectives, content, quiz

5. **Create Supabase Tables** (30 min)
   - SQL schema
   - RLS policies
   - Test insert/select

---

## Testing Checklist

- [ ] All CSS/JS imports use relative paths
- [ ] Site works on `domain.com/mathyxo/`
- [ ] Site works on custom domain (no `/mathyxo/` prefix)
- [ ] Curriculum loads from data/curriculum.json
- [ ] Lessons render correctly from data
- [ ] Supabase auth works (login/register)
- [ ] Progress saves to Supabase
- [ ] XP/badges update correctly
- [ ] RTL/Arabic mode works
- [ ] Mobile responsive
- [ ] No console errors

---

## Deployment Checklist

- [ ] All environment variables set
- [ ] Firebase config removed
- [ ] Supabase keys configured
- [ ] GitHub Pages domain configured
- [ ] Custom domain (if used) configured
- [ ] GitHub Actions workflow set up
- [ ] Supabase RLS policies active
- [ ] Curriculum populated in Supabase

---

## Blockers & Dependencies

**None currently identified** — this is a greenfield refactor, so we can proceed independently.

---

## Success Metrics

✅ **Security**: No exposed keys in browser  
✅ **Paths**: Works on any domain/prefix  
✅ **Architecture**: Data-driven, not monolithic  
✅ **Curriculum**: 50+ lessons across all levels  
✅ **Supabase**: User auth + progress tracking working  
✅ **Docs**: Clear README, deployment guide, architecture docs  

---

## Next Steps

1. Review this plan
2. Start Phase 1 (security & paths)
3. Create data/curriculum.json (Phase 3)
4. Set up Supabase (Phase 4)
5. Refactor components (Phase 2)
6. Add curriculum content (Phase 7)

---

**Created**: 2026-10-11  
**Branch**: `refactor/security-and-curriculum`  
**Owner**: @matheuxmed  
