# SellerOS AI

**One Dashboard. Every Marketplace. Complete Business Control.**

A premium, AI-powered multi-marketplace analytics and operations dashboard prototype for Indian e-commerce sellers — covering Amazon, Flipkart, Meesho, Myntra, quick commerce and D2C channels in a single command centre.

Built with React 18, Vite, Tailwind CSS, Recharts and lucide-react.

---

## 1. Project structure

```
seller-os-ai/
├── .github/
│   └── workflows/
│       └── deploy.yml        # GitHub Actions: build + deploy to GitHub Pages
├── public/
│   └── favicon.svg
├── src/
│   ├── App.jsx                # Main dashboard app (all pages + components)
│   ├── index.css              # Tailwind directives + global styles
│   └── main.jsx                # React entry point
├── .gitignore
├── index.html                  # HTML shell, meta tags, fonts
├── package.json
├── postcss.config.js
├── tailwind.config.js
├── vite.config.js
└── README.md
```

## 2. Run it locally

Requires [Node.js](https://nodejs.org) 18 or later.

```bash
# 1. Install dependencies
npm install

# 2. Start the dev server
npm run dev
```

Then open the URL Vite prints (usually `http://localhost:5173`).

## 3. Build for production

```bash
npm run build      # outputs to /dist
npm run preview    # preview the production build locally
```

## 4. Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit: SellerOS AI dashboard"
git branch -M main
git remote add origin https://github.com/<your-username>/<your-repo>.git
git push -u origin main
```

## 5. Deploy on GitHub Pages (recommended, zero extra tools)

This repo already includes `.github/workflows/deploy.yml`, which builds the
app and publishes it automatically on every push to `main`.

1. Push the repo to GitHub (step 4 above).
2. In your repo, go to **Settings → Pages**.
3. Under **Build and deployment → Source**, choose **GitHub Actions**.
4. Push any commit to `main` (or re-run the workflow from the **Actions** tab).
5. Your site will be live at:
   `https://<your-username>.github.io/<your-repo>/`

No manual build step is required — the workflow handles `npm ci`, `npm run build`,
and publishing the `dist/` folder.

### Alternative: deploy with the `gh-pages` package

If you prefer a manual/local deploy instead of GitHub Actions:

```bash
npm run deploy
```

This builds the app and pushes `dist/` to a `gh-pages` branch using the
`gh-pages` package (already in `devDependencies`). Then set
**Settings → Pages → Source** to **Deploy from a branch → `gh-pages`**.

## 6. Deploy on Vercel or Netlify (alternative)

Both platforms auto-detect Vite projects:

- **Vercel**: Import the GitHub repo → framework preset "Vite" → deploy.
- **Netlify**: Import the GitHub repo → build command `npm run build` → publish directory `dist`.

No config changes are needed; `vite.config.js` already uses a relative
`base: "./"` so the build works from any subpath or root domain.

---

## 7. What's included

- **Fully built pages**: Dashboard, Orders, Inventory, Sales, Finance, Advertising,
  Returns, Customer Analytics, AI Assistant, Settings.
- **Roadmap placeholders**: Warehouse, Purchase Planning, Forecasting, Pricing,
  Competition, Products, Support Tickets, Alerts, Reports, Automation — wired
  into navigation with a polished "coming soon" state.
- Dark/light theme toggle, responsive sidebar + mobile bottom navigation,
  floating AI assistant widget, and an AI insight ticker.
- All data in `src/App.jsx` is mock/sample data — replace the constants near
  the top of the file (`KPIS`, `ORDERS`, `INVENTORY`, etc.) with real API/sheet
  data when you're ready to connect it to live sources.

## 8. Customizing branding

- Colors: search `src/App.jsx` for the `COLORS` object and Tailwind's
  `amber` / `teal` / `rose` / `violet` / `sky` classes used throughout.
- Fonts: change the Google Fonts link in `index.html` and the `fontFamily`
  values in `tailwind.config.js`.
- Favicon: replace `public/favicon.svg`.
