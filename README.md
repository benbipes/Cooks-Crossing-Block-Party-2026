# 🎈 Cooks Crossing Annual Block Party & Pig Roast 2026

A modern, responsive neighborhood potluck coordination website designed specifically for the **Cooks Crossing Annual Block Party**.

Hosted at the field near Julie Byers' home at the corner of **Wiembley and Brentford** on **Saturday, October 3rd, 2026 at 4:00 PM**.

---

## 🌟 Features Included

- **📸 Custom Hero Background**: Features the scenic neighborhood hot air balloon landing photo with an atmospheric gradient overlay for maximum readability.
- **🐷 Pig Roast & Host Spotlight**: Highlights James Strickland smoking a whole pig for everyone and Julie Byers hosting at the corner of Wiembley & Brentford.
- **🥗 Interactive Potluck Side Dish Tracker**:
  - Homeowners can easily sign up with their name, street/house number, dish name, category, approximate servings, and dietary tags (Vegetarian, Gluten-Free, Nut-Free, Dairy-Free, Crockpot outlet needed, etc.).
  - **Pre-populated with neighbor dishes** on initial load (pig roast, cornbread, potato salad, smoked mac & cheese, sweet corn, apple crisp, etc.).
  - **Persistent storage**: Entries are automatically saved to `localStorage` and never lost on page reload.
  - Interactive search bar, category filters, dietary filter toggles, and sorting options.
  - "😋 Can't wait!" cheer reaction counter for each dish.
  - Confetti celebration upon signing up!
- **🎯 Games & Activities**:
  - Cornhole Tournament 2v2 sign-up with live team roster.
  - Grass Volleyball pickup game interest sign-up.
- **⏱️ Live Event Countdown**: Real-time countdown to Saturday, October 3rd, 2026 at 4:00 PM.
- **🖨️ Day-of Buffet Checklist & Print Mode**: Optimized print stylesheet (`@media print`) so organizers can print a clean checklist to place at the food table.
- **📥 CSV Export**: One-click download of the complete potluck list for spreadsheets.
- **☁️ Multi-Household Sync Options**:
  - **Shareable Snapshot Link**: Generates a link with current potluck dishes encoded for sharing via text or email.
  - **Optional Firebase Live Sync**: Free, serverless real-time database integration across multiple devices.

---

## 🚀 How to Publish to GitHub Pages (Step-by-Step)

You can publish this website on your GitHub account in less than 2 minutes using GitHub Pages:

### Step 1: Create a Repository on GitHub
1. Go to [github.com/new](https://github.com/new).
2. Name your repository (e.g. `cooks-crossing-block-party` or `cooks-crossing-2026`).
3. Set the repository to **Public**.
4. Leave "Add a README file" **unchecked** (we already have one).
5. Click **Create repository**.

### Step 2: Push This Code to Your GitHub Repository
Open your terminal in this folder and run:

```bash
# 1. Add your GitHub repository as the remote (replace with your GitHub username and repo name):
git remote add origin https://github.com/<YOUR_GITHUB_USERNAME>/<YOUR_REPOSITORY_NAME>.git

# 2. Rename branch to main (if not already):
git branch -M main

# 3. Push the files:
git push -u origin main
```

*(Note: The local git repository has already been initialized and committed for you!)*

### Step 3: Turn On GitHub Pages
1. Go to your repository on GitHub.
2. Click **Settings** (gear icon near the top right).
3. In the left sidebar, click **Pages** (under the "Code and automation" section).
4. Under **Build and deployment** > **Source**, choose **Deploy from a branch**.
5. Under **Branch**, select `main` and folder `/ (root)`, then click **Save**.
6. Wait 1–2 minutes, and GitHub will provide your live URL:
   ```
   https://<YOUR_GITHUB_USERNAME>.github.io/<YOUR_REPOSITORY_NAME>/
   ```

---

## 📂 File Structure

```
├── index.html        # Main HTML structure with Tailwind CSS, Lucide icons & Confetti
├── styles.css        # Custom styles, animations, and @media print rules
├── app.js            # Reactive application logic, persistence, countdown & games
├── hero-bg.jpg       # Neighborhood hot air balloon hero background
├── .nojekyll         # Disables Jekyll processing on GitHub Pages
└── README.md         # Documentation & deployment guide
```

---

## 💡 Optional: Enabling Real-Time Multi-Household Cloud Sync

While `localStorage` instantly keeps all entered items saved on each neighbor's browser, you can also enable real-time multi-household synchronization across everyone's phones without running any servers:

1. Create a free project at [console.firebase.google.com](https://console.firebase.google.com/).
2. Create a **Firestore Database** in test mode (or allow read/write for your block party date).
3. Register a Web App in Firebase and copy your `firebaseConfig` object.
4. On the block party website, click the **Saved / Sync** button in the top navigation or footer.
5. Paste your Firebase configuration and click **Save Cloud Config**.
6. All neighbors visiting the link will now see instant live updates whenever someone adds or modifies a dish!
