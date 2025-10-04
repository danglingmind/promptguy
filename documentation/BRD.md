# 1. Platform Overview

PromptGuy.in is a **blog-style social platform** where users can **create, share, and discover prompts**. The app focuses on **community-driven content discovery**, virality optimization, and a **clean, mobile-first UI**.

---

## 2. Core Features

### **2.1 Feed & Discovery**

- Centralized **feed page** showing blog-style prompt posts.
- **Search, filter, and sort** functionality (e.g., by model, category, popularity, recency).
- Feed ordering powered by a **dynamic ranking algorithm** (frequently updated to optimize virality).
- Multiple **featured sections** (e.g., *Most Popular This Week*, *Most Popular Worldwide*, *Trending in Code*).
    - Each section is based on a **pluggable logic pattern**, making it easy to add/modify new featured categories.

---

### **2.2 Post Interactions**

- **Like** / **Dislike**
- **Bookmark** (saved posts for quick access later)
- **Share externally** (copy link / share via social apps)
- **Follow creators** to see their posts in a personalized feed

---

### **2.3 Post Creation**

- Required metadata fields when creating a post:
    - **Prompt text**
    - **Model type** (e.g., GPT, Stable Diffusion, etc.)
    - **Purpose** (e.g., code, image, writing, productivity, etc.)
- These fields should be **flexible and extendable** (easy to update/add new required fields without breaking existing posts).

---

### **2.4 Notifications**

- In-app notification center for:
    - New followers
    - Likes / bookmarks on posts
    - Updates to followed users’ activity
    - System updates / featured highlights

---

## 3. Design Principles

- **UI/UX**: Compact, minimal, sleek
- **Mobile-first design** (progressive enhancement for desktop)
- **Reusable patterns** for:
    - Featured sections logic
    - Post creation fields

---

## 4. Future Considerations (Extendability)

- Personalized feed (based on user preferences + following list).
- Advanced analytics on post engagement for ranking algorithm tuning.
- Creator profiles showcasing all their shared prompts.
- Gamification elements (badges, top creators, etc.).