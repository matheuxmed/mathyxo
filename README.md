# MatheuxMed 📐

A free, interactive mathematics learning platform for Moroccan students spanning Primaire through Baccalauréat levels.

## 🎯 Quick Start

### For Users
1. Visit the deployed site: [GitHub Pages link]
2. Select your education level (Primaire, Collège, Tronc Commun, or Bac)
3. Work through lessons, quizzes, and exercises
4. Track your progress and earn badges (with Supabase login)

### For Developers

#### Prerequisites
- Node.js 14+ (for local development)
- Git
- A Supabase account (for backend development)

#### Local Development
```bash
# Clone the repository
git clone https://github.com/matheuxmed/mathyxo.git
cd mathyxo

# Copy environment template
cp .env.example .env.local

# Fill in your Supabase credentials
# VITE_SUPABASE_URL=https://your-project.supabase.co
# VITE_SUPABASE_ANON_KEY=your-anon-key

# No build step needed - open index.html in browser or use a simple server:
python -m http.server 8000
# Visit http://localhost:8000
```

## 📁 Project Structure

```
mathyxo/
├── README.md                    # This file
├── REFACTOR_PLAN.md            # Implementation roadmap
├── PROGRESS.md                 # Session-by-session progress log
├── .env.example                # Environment variables template
│
├── index.html                  # Landing page
├── contact.html                # Contact/social links
├── lesson-detail.html          # Dynamic lesson template (future)
│
├── data/
│   ├── curriculum.json         # All lesson definitions
│   └── curriculum.js           # Helper functions
│
├── css/
│   ├── main.css                # Main styles
│   ├── rtl.css                 # Arabic/RTL support
│   ├── responsive.css          # Mobile-first breakpoints
│   ├── components.css          # Reusable component styles
│   └── language-switcher.css   # Language switcher UI
│
├── js/
│   ├── app.js                  # Main entry point
│   ├── supabase-client.js      # Supabase initialization
│   ├── auth.js                 # Authentication functions
│   ├── curriculum.js           # Curriculum loading & rendering
│   ├── gamification.js         # XP, badges, levels system
│   ├── ui.js                   # Toast, modal, notifications
│   ├── i18n.js                 # Internationalization (500+ keys)
│   ├── language-switcher.js    # Language selection
│   └── components.js           # Refactored UI components
│
├── pages/
│   ├── levels/
│   │   ├── primaire.html       # Primaire level overview
│   │   ├── college.html        # Collège level overview
│   │   ├── tronc-commun.html   # Tronc Commun overview
│   │   └── bac.html            # Bac level overview
│   ├── student-dashboard.html  # Student progress dashboard
│   └── admin-dashboard.html    # Admin panel (future)
│
├── docs/
│   ├── CURRICULUM.md           # How to add lessons
│   ├── DEPLOYMENT.md           # GitHub Pages & Supabase setup
│   ├── ARCHITECTURE.md         # Technical decisions
│   └── API.md                  # Supabase database schema
│
└── .github/
    └── workflows/
        └── deploy.yml          # Auto-deploy on push
```

## 🏗️ Architecture

### Frontend
- **Static HTML/CSS/JavaScript** (no build step required)
- **GitHub Pages** for hosting
- **Relative paths** for portability across domains

### Backend (Planned)
- **Supabase** for authentication, database, and real-time updates
- **Row Level Security** for user privacy
- **PostgreSQL** for structured curriculum & progress data

### Key Features
✅ **Internationalization** (French + Arabic with RTL support)  
✅ **Gamification** (XP points, badges, levels)  
✅ **Progress Tracking** (with Supabase integration)  
✅ **Mobile Responsive** (works on all devices)  
✅ **Teacher Dashboard** (track student progress)  

## 📚 Moroccan Curriculum Levels

### Primaire (6 years: P1–P6)
- Numbers & Operations
- Fractions
- Plane Geometry
- Measurement
- Problem Solving

### Collège (3 years: C1–C3)
- Integers & Rationals
- Powers & Roots
- First Degree Equations
- Linear Functions
- Geometry (Triangles, Circles)
- Statistics & Probability

### Tronc Commun (1 year)
- Affine & Quadratic Functions
- Equations & Inequalities
- Analytic Geometry
- Vectors
- Trigonometry
- Advanced Probability & Statistics

### Baccalauréat (2 years, multiple specialties)

**Year 1:**
- SE (Science Expérimentale)
- SM (Science Mathématique)
- SH (Sciences Humaines)

**Year 2:**
- PC (Physique-Chimie)
- SVT (Sciences de la Vie et de la Terre)
- SM (Mathématique Spécialisée)
- SH (Humanités Spécialisées)

## 🔐 Security

### Current Status
⚠️ Firebase config is embedded in browser (being migrated to Supabase)

### Migration to Supabase
- [ ] Replace Firebase SDK with Supabase client
- [ ] Store only PUBLIC anon key in frontend
- [ ] Service role key stored server-side only
- [ ] Implement Row Level Security policies

### Environment Variables
```bash
# .env.local (keep this file private!)
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-public-anon-key-only
```

**Never commit `.env.local`** or expose service role keys.

## 🚀 Deployment

### GitHub Pages (Static Frontend)
```bash
# Push to main branch
git push origin main

# GitHub Pages automatically deploys from docs/ or root
# Configure in repo Settings > Pages > Source: main branch
```

### Supabase (Backend)
```bash
# Create Supabase project
# Run SQL schema from docs/API.md
# Set environment variables in GitHub Secrets
```

### Custom Domain
1. In GitHub repo: Settings > Pages > Custom Domain
2. Add DNS CNAME record pointing to GitHub Pages
3. Enable HTTPS

## 📖 Contributing

### Adding a New Lesson

1. **Add to data/curriculum.json:**
```json
{
  "id": "lesson-arabic-001",
  "level": "primaire-1",
  "chapter": "numbers-operations",
  "title": "الأعداد من 1 إلى 10",
  "slug": "nombres-1-10",
  "duration": 15,
  "difficulty": "easy",
  "objectives": ["...", "..."],
  "content": { ... },
  "quiz": { ... }
}
```

2. **Update translations** in `js/i18n.js`
3. **Test** on all devices and browsers
4. **Submit PR** with lesson content and translations

See [CURRICULUM.md](docs/CURRICULUM.md) for detailed guidelines.

### Reporting Issues
Use GitHub Issues with labels:
- `bug` - Something broken
- `feature` - New functionality
- `curriculum` - Missing or incomplete lessons
- `translation` - Language/RTL issues
- `security` - Vulnerabilities (use security advisory)

### Code Style
- Use 4-space indentation
- Use descriptive variable names
- Add comments for complex logic
- Follow existing patterns

## 🌐 Languages & RTL Support

### Supported Languages
- 🇫🇷 French (Français) - LTR
- 🇸🇦 Arabic (العربية) - RTL

### Adding a Language
1. Add to `js/i18n.js` languages object
2. Add 500+ translation keys
3. Test RTL/LTR layout
4. Update README

## 📊 Gamification System

Students earn:
- **XP** for completing lessons and quizzes
- **Badges** for milestones
- **Levels** that increase with XP (100 XP = 1 level)
- **Streaks** for consistent daily practice

## 🧪 Testing

### Manual Testing Checklist
- [ ] All links work with relative paths
- [ ] CSS loads correctly
- [ ] JavaScript console has no errors
- [ ] Mobile view is responsive
- [ ] Arabic/RTL mode works
- [ ] Language switcher works
- [ ] Gamification XP updates
- [ ] Auth login/register works (with Supabase)
- [ ] Lessons load from data/curriculum.json
- [ ] Quiz scoring works

### Browser Support
✅ Chrome 90+  
✅ Firefox 88+  
✅ Safari 14+  
✅ Edge 90+  
✅ Mobile browsers  

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/matheuxmed/mathyxo/issues)
- **Email**: contact@matheuxmed.com
- **Social**: [GitHub](https://github.com/matheuxmed) | [LinkedIn](https://linkedin.com/in/matheuxmed) | [Twitter](https://twitter.com/matheuxmed)

## 📄 License

MIT License - See LICENSE file for details

## 🙏 Acknowledgments

- Moroccan Ministry of Education curriculum standards
- Students and teachers for feedback
- Contributors and maintainers

---

**Last Updated**: 2026-10-11  
**Status**: Under Active Development  
**Branch**: `refactor/security-and-curriculum`
