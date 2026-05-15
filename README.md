# Decode2Deploy — Core Platform 🕵️‍♂️💻

Welcome to the **Decode2Deploy** repository! This is the core platform powering a developer-investigation ARG (Alternate Reality Game) challenge. 

Designed with a heavy cyberpunk, "dark dev", and MPC Hacks inspired aesthetic, this platform manages team authentication, puzzle progression, clue validation, and a live leaderboard.

---

## 🏗️ Architecture & Stack

- **Frontend**: Next.js 16 (App Router), React, Tailwind CSS, Framer Motion
- **Backend API**: Next.js Route Handlers (`app/api/...`)
- **Database**: MongoDB Atlas (via Mongoose)
- **Styling**: Vanilla CSS (`globals.css`) + Tailwind config tokens
- **Auth**: JWT stored in HttpOnly cookies (No frontend state to hack)

---

## 🔒 Security & Anti-Cheat

Because this is a developer puzzle, participants **will** try to cheat by inspecting the frontend, checking network requests, and reverse-engineering the logic. We built the platform specifically to prevent this:

1. **Answers are Database-Only**: Clue answers and future clues are *never* sent to the frontend.
2. **Server-Side Validation**: Clue validation happens securely on the backend (`/api/submit`).
3. **No Preloading**: Teams only receive the exact `title` and `hint` for their current stage via `/api/clue/current`.
4. **Rate Limiting**: Custom in-memory rate limiting prevents brute-forcing passwords and clue answers.
5. **Activity Logging**: Every submission is logged with an IP address, timestamp, and correctness boolean. Suspicious teams (>10 wrong attempts in 5 mins) are flagged in the Admin Dashboard.

---

## 🚀 How to Run Locally

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Setup
You need a MongoDB Atlas cluster and two secret keys. Copy the example environment file:
```bash
cp .env.local.example .env.local
```
Fill in `.env.local` with your details:
- `MONGODB_URI`: Your MongoDB Atlas connection string.
- `JWT_SECRET`: A secure random string for signing team sessions.
- `ADMIN_SECRET`: The passphrase required to access the admin dashboard.

### 3. Seed the Database
To populate the database with placeholder clues and some test teams (e.g., `Team Alpha`, password: `alpha123`), run:
```bash
npm run seed
```
*(⚠️ **Important**: Delete the test teams from the database before the live event!)*

### 4. Start the Development Server
```bash
npm run dev
```
Navigate to `http://localhost:3000` to access the platform.

---

## 🕵️‍♂️ Next Steps: Adding the Real Clues

Currently, the clues seeded into the database are placeholders. The next step for the team is to integrate the actual OSINT/investigation challenges. 

**DO NOT hardcode the real clues into `scripts/seed.ts` and push them to GitHub!** If you do, anyone looking at the repository can easily find the answers.

To add the real clues securely:
1. Open your MongoDB Atlas dashboard.
2. Go to the `clues` collection.
3. Manually update the `title`, `hint`, and `answer` fields for clues 1 through 5.

---

## 👑 Admin Dashboard

Access the admin dashboard at `http://localhost:3000/admin`. You will need to enter the `ADMIN_SECRET` defined in your `.env.local` file.

From the admin dashboard you can:
- View the live leaderboard.
- See all registered teams, their progression, and any flagged suspicious activity.
- View a real-time log of every submitted answer.
- Manually unlock a clue for a team if they encounter technical difficulties.

---

*Built with 💻 for the Decode2Deploy Challenge.*
