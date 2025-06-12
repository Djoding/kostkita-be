# 🏠 Kost Management System - Backend API

## 📋 Deskripsi Proyek

Kost Management System adalah aplikasi backend untuk mengelola sistem kost yang terintegrasi dengan layanan catering dan laundry. Sistem ini dirancang untuk memudahkan pengelola kost, penghuni, dan penyedia layanan dalam menjalankan operasional sehari-hari.

### 🎯 Fitur Utama
- **User Management**: Sistem autentikasi multi-role (Admin, Pengelola, Penghuni, Tamu)
- **Kost Management**: Pengelolaan kost, kamar, fasilitas, dan peraturan
- **Reservation System**: Sistem booking dengan workflow approval
- **Catering Service**: Layanan pemesanan makanan
- **Laundry Service**: Layanan pemesanan laundry
- **Payment Integration**: Integrasi pembayaran QRIS 

### 🛠 Tech Stack
- **Backend**: Node.js + Express.js
- **Database**: PostgreSQL
- **Authentication**: JWT & OAuth
- **File Storage**: Local Storage
- **Documentation**: Postman API

---

## 🚀 Git Flow & Development SOP

### 📊 Branch Structure

```
main (production)
├── development (staging)
    ├── feature/user-auth (Derva)
    ├── feature/kost-room (Fizi)
    ├── feature/reservation (Amib)
    └── feature/services (Fikri)
```

### 🔄 Git Workflow Step-by-Step

#### 1. **Persiapan Awal**
```bash
# Clone repository
git clone https://github.com/djoding/kostkita-be.git
cd kostkita-be

# Menuju branch lokal
git checkout feature/your-feature-name
```

#### 2. **Development Cycle**
```bash
# Selalu update dari development sebelum mulai kerja
git checkout development
git pull origin development
git checkout feature/your-feature-name
git merge development

# Lakukan development work...
# Commit dengan conventional commit format
git add .
git commit -m "feat: add user authentication middleware"
git push origin feature/your-feature-name
```

#### 3. **Pull Request Process**
1. **Buat PR** dari `feature/your-feature-name` → `development`
2. **PR Title Format**: `[FEATURE] Brief description`
3. **PR Description Template**:
   ```markdown
   ## 📝 Description
   Brief description of changes
   
   ## ✅ Checklist
   - [ ] Code follows project conventions
   - [ ] Tests added/updated
   - [ ] Documentation updated
   - [ ] No merge conflicts
   
   ## 🧪 Testing
   - Manual testing steps
   - API endpoints tested
   
   ## 📸 Screenshots (if applicable)
   ```

#### 4. **Code Review & Merge**
- **Minimum 1 reviewer** required
- **All conversations resolved** before merge
- **Squash and merge** to development
- **Delete feature branch** after merge

---

## 📝 Commit Convention

### Format: `type(scope): description`

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding tests
- `chore`: Maintenance tasks

**Examples:**
```bash
git commit -m "feat(auth): add JWT token validation middleware"
git commit -m "fix(reservation): resolve booking date validation bug"
git commit -m "docs(api): update user endpoints documentation"
git commit -m "refactor(kost): optimize room search query"
```

---

## 🔍 Pull Request Guidelines

### 📋 PR Checklist Template
```markdown
## Pre-submission Checklist
- [ ] Code follows ESLint configuration
- [ ] All tests pass
- [ ] API endpoints documented in Swagger
- [ ] Database migrations included (if any)
- [ ] Environment variables documented
- [ ] No console.log() in production code
- [ ] Error handling implemented
- [ ] Input validation added
```

### 👥 Review Process

**Reviewer Responsibilities:**
1. **Code Quality**: Check for best practices, performance, security
2. **Testing**: Verify test coverage and functionality
3. **Documentation**: Ensure API docs are updated
4. **Convention**: Verify naming conventions and code structure

**Review Comments Format:**
- `[MUST FIX]`: Critical issues that must be resolved
- `[SUGGESTION]`: Improvements or alternatives
- `[NITPICK]`: Minor style/preference issues
- `[QUESTION]`: Clarification needed

---

## 🚦 Deployment Flow

### Development → Staging
1. Feature branches → `development` (via PR)
2. Regular deployment to staging server
3. Integration testing pada staging

### Staging → Production
1. `development` → `main` (via PR)
2. **Release Manager** approval required
3. **Production deployment** with rollback plan

### 🏷 Release Tagging
```bash
# Semantic versioning: v1.0.0
git tag -a v1.0.0 -m "Release version 1.0.0"
git push origin v1.0.0
```

---

## 🛡 Branch Protection Rules

### `main` Branch
- Require PR with 2 approvals
- No direct push allowed
- Require up-to-date branches

### `development` Branch  
- Require PR with 1 approval
- Require status checks
- Allow force push by admins only

---

## 🤝 Collaboration Guidelines

### 📅 Daily Standup Format
- **Yesterday**: What did you complete?
- **Today**: What will you work on?
- **Blockers**: Any impediments?
- **Dependencies**: Waiting for others?

### 🔄 Integration Points
- **Week 1-2**: Parallel development
- **Week 3**: Integration testing (Derva + Fizi)
- **Week 4**: Full system integration (All features)

### 💬 Communication Channels
- **Slack/Discord**: Daily updates
- **GitHub Issues**: Bug tracking
- **GitHub Discussions**: Technical discussions
- **PR Comments**: Code-specific discussions

---

## 🆘 Troubleshooting

### Common Issues

**Merge Conflicts:**
```bash
git checkout development
git pull origin development
git checkout feature/your-feature
git merge development

# Resolve conflicts manually
git commit -m "resolve: merge conflicts with development"
```

**Rebase Interactive (Clean history):**
```bash
git rebase -i HEAD~3  # Last 3 commits
# Edit commits, then force push
git push -f origin feature/your-feature
```

**Emergency Hotfix:**
```bash
git checkout main
git pull origin main
git checkout -b hotfix/critical-bug-fix

# Make fix
git commit -m "fix: critical bug in production"
# PR to main with priority review
```

---

## 📞 Support
- **Technical Issues**: Create GitHub Issue
- **Process Questions**: Ask in team chat

**Team PIC:**
- **Github Reviewer**: Derva
