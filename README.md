# Just One Thing 🎲

> **One decision at a time.** Stop the mental spiral — drop your options in, we pick one. You breathe.

A lightweight, beautiful decision-reducer built for overthinkers, ADHD brains, and anyone who's ever stared at 12 tabs wondering what to do next. No accounts, no servers, no noise.

---

## ✨ Features

### 🎲 Spin Tab — The Decision Wheel
- Add any options (meals, tasks, activities, anything)
- Hit **Pick For Me** and watch it shuffle to a single answer
- Mark done (removes from list), remove, or spin again
- **Quick Presets** — one-tap load of Meals, Work Tasks, Break Activities, or Exercise options
- **Saved Lists** — attach a spin to any of your reusable lists

### ✦ Priority Tab — Daily Focus
- Add up to **5 priorities** for today (enforced limit — focus is the point)
- Hit **Surface My #1 Priority** to get a single clear focus
- Check off items with satisfying confetti
- **Auto-resets daily** — fresh slate every morning, no guilt

### 📋 Lists Tab — Reusable Option Banks
- Create named lists (Dinner Ideas, Side Projects, etc.)
- Add/remove items at any time
- Load any list directly into the Spin tab
- Persists across sessions via localStorage

### UX Details
- 🌙 Dark mode by default, ☀️ light mode toggle
- Confetti on completions
- Shuffling animation before reveal (builds anticipation, cuts anxiety)
- Mobile-first, works perfectly on phone
- Zero friction — no login, no setup, works offline

---

## 🚀 Deploy in 60 Seconds

1. **Create a new GitHub repository** (e.g. `just-one-thing`)
2. **Upload files** maintaining this exact structure:
   ```
   just-one-thing/
   ├── index.html
   ├── css/
   │   └── style.css
   ├── js/
   │   └── app.js
   └── README.md
   ```
3. Go to **Settings → Pages → Deploy from main branch (/ root) → Save**
4. Your app is live at `https://yourusername.github.io/just-one-thing`

> **Tip:** You can drag-and-drop the whole folder into GitHub's file uploader — it creates the folder structure automatically.

---

## 🛠 Tech Stack

| Layer | Choice | Why |
|-------|--------|-----|
| Markup | HTML5 | Simple, semantic |
| Styles | Tailwind CDN + plain CSS | Zero build step, full control |
| Logic | Vanilla JS | No dependencies, fast |
| Persistence | localStorage | Works offline, instant |
| Fonts | Playfair Display + DM Sans | Warm, editorial, distinctive |
| Confetti | canvas-confetti CDN | Delightful micro-reward |

No build tools. No bundlers. No Node. Open `index.html` and it works.

---

## 📸 Screenshots

*(Add screenshots here after deployment)*

- `screenshot-spin.png` — The spin tab with options loaded
- `screenshot-result.png` — Result card after a pick
- `screenshot-priority.png` — Daily focus list
- `screenshot-lists.png` — Saved lists management

---

## 🗺 Future Ideas

These are intentionally left out of the MVP to keep it focused:

- [ ] **Drag-to-reorder** priorities (drag handle + touch support)
- [ ] **Weighted options** — some choices appear more often
- [ ] **Categories** — color-code your lists
- [ ] **Daily recap** — "You completed 4/5 priorities today 🔥"
- [ ] **Share a list** — generate a URL with options pre-loaded
- [ ] **PWA / install to homescreen** — add manifest + service worker
- [ ] **Export/import** — backup your lists as JSON
- [ ] **Time-blocking** — assign rough durations to priorities
- [ ] **Streak tracking** — consecutive days completing all priorities

---

## 💡 The Pain Point This Solves

> *"Too many options create mental noise. The problem isn't your brain. It's the lack of structure."*

Decision fatigue is real — especially for ADHD and overthinker brains. The moment you have more than ~4 options, paralysis sets in. **Just One Thing** removes the choice burden entirely:

- You provide the options (your preferences, your context)
- The app narrows it to **one**
- You act, instead of spiral

It's the 80/20 of decision tools: maximum calm from minimum complexity.

---

## 📄 License

MIT — use it, fork it, sell it, build on it. Just don't make it complicated.
