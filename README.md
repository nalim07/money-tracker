# Money Tracker 💰

**Money Tracker** is a modern, responsive personal finance tracking application designed to help you manage your money with ease. Built with a focus on simplicity and visual excellence, it allows you to track income, expenses, and manage multiple wallets in one place.

## ✨ Features

- **Transaction Management**: Easily record income and expenses with categories.
- **Wallet Grouping**: Organize your finances into different wallets (e.g., Bank, Cash, Savings).
- **Visual Analytics**: Gain insights into your spending habits with interactive charts.
- **Modern UI**: A premium, responsive design built with React, Tailwind CSS, and shadcn/ui.
- **Real-time Sync**: Powered by Supabase for secure data storage and authentication.

## 🛠️ Tech Stack

- **Frontend**: [React](https://reactjs.org/) + [Vite](https://vitejs.dev/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) + [shadcn/ui](https://ui.shadcn.com/)
- **Database & Auth**: [Supabase](https://supabase.com/)
- **Icons**: [Lucide React](https://lucide.dev/) & [FontAwesome](https://fontawesome.com/)

## 🚀 Getting Started

Follow these steps to set up the project locally.

### Prerequisites

Make sure you have the following installed:
- [Node.js](https://nodejs.org/) (v18 or higher)
- [npm](https://www.npmjs.com/) or [bun](https://bun.sh/)

### Installation

1. **Clone the repository**
   ```sh
   git clone <repository-url>
   cd Money-tracker
   ```

2. **Install dependencies**
   ```sh
   npm install
   # or
   bun install
   ```

3. **Environment Setup**
   Create a `.env` file in the root directory and add your Supabase credentials (refer to `.env.example`):
   ```env
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_publishable_key
   ```

4. **Run development server**
   ```sh
   npm run dev
   ```
   Open [http://localhost:5173](http://localhost:5173) in your browser.

## 🌐 Self Hosting

To host this project yourself, you will need a Supabase project and a static hosting provider (Vercel, Netlify, GitHub Pages, etc.).

1. **Supabase Setup**:
   - Create a new project on [Supabase](https://supabase.com/).
   - Set up your database tables and authentication.
   - Get your **Project URL** and **Publishable Key** from the Supabase dashboard (Project Settings > API).

2. **Build for Production**:
   ```sh
   npm run build
   ```
   This will generate a `dist` folder.

3. **Deploy**:
   - Upload the contents of the `dist` folder to your preferred hosting provider.
   - Ensure the environment variables (`VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`) are correctly configured in your deployment settings.

---

*Manage your cash, the easy way.*
