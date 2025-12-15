# Portfolio Tracker

A comprehensive portfolio management application built with Next.js, enabling users to track and manage their investments across multiple markets including BIST100 (Turkish Stock Exchange), US Markets, and Precious Metals.

## Features

### 🔐 Authentication
- Secure user authentication with Firebase Auth
- Email/password registration and login
- Protected dashboard routes
- Session management

### 📊 Multi-Market Portfolio Management
- **Total Portfolio Overview**: Consolidated view of all investments
- **BIST100**: Turkish stock market tracking (TRY)
- **US Markets**: American stock market tracking (USD)
- **Precious Metals**: Gold, silver, and other precious metals (TRY)

### 💹 Real-Time Data
- Live price updates using Yahoo Finance API
- Automatic portfolio value calculations
- Real-time profit/loss tracking
- Currency-specific pricing
- **Smart Exchange Rate Handling**: Automatic fetching of current USD/TRY rates with optional manual override for precise historical tracking.

### 📈 Interactive Dashboard
- Dynamic portfolio distribution charts with Recharts
  - Total portfolio view with category breakdown
  - Individual category distribution charts (BIST100, US Markets, Precious Metals)
- Detailed holdings tables with current values
  - Sortable columns (default: Total Value descending)
  - Dividend tracking per asset
- Transaction history tracking (Buy/Sell/Dividend)
- Summary cards showing key metrics
- Refresh functionality for real-time updates
- Modern interactive tooltips with percentage breakdowns
- **Portfolio Analytics**:
  - Interactive multi-line chart for wealth evolution
  - Category-based filtering (BIST100, US Stocks, Metals)
  - Time range selection (1D to 5Y)
  - Time range selection (1D to 5Y)
  - Mock data integration for demonstration

### 💰 Income Tracker
- **Monthly Income Matrix**: Grid view of income streams (dividends, rents, etc.)
- **Multi-Currency Support**: 
  - Toggle between **TRY** and **USD** views instantly
  - **Smart Currency Conversion**: Automatic USD value calculation with customizable exchange rates
  - Historical data preserved with fixed exchange rates
- **Multi-Year Tracking**: Support for years 2025-2036
- **Detailed Breakdown**:
  - Monthly and yearly totals in selected currency
  - Category-based income tracking
  - Tooltips displaying both TRY and USD values simultaneously
  - Company/asset tracking for income sources
- **Income History Table**:
  - Comprehensive view of all income records
  - **Dual Currency Columns**: View amounts in both TRY and USD
  - Pagination support for large datasets
  - Sortable columns for easy filtering
- **Automatic Dividend Integration**:
  - Portfolio dividend transactions automatically sync to income tracker
  - Seamless tracking of dividend income from your investments
- **Management**:
  - Add multiple months at once
  - Edit/Delete individual entries
  - Company selection from portfolio assets
  - Real-time updates

### 🐷 Investment Tracker
- **Capital Evolution Matrix**: 
  - Track total invested capital (Buys) over time
  - Dynamic yearly and monthly breakdown
  - **Multi-Currency View**: Toggle between TRY and USD to see capital injection in hard currency
- **Investment History Table**:
  - Dedicated table for "Buy" transactions
  - Tracks detailed history of capital additions
  - **Dual Currency Columns**: See the exact USD value of investments at the time of purchase
  - Pagination and sorting for easier management

### 🎯 Goals & Targets
- **Interactive Goal Setting**: 
  - Define financial milestones for specific asset classes
  - Supported Categories: 'BIST100', 'US STOCKS', 'PRECIOUS METALS', 'EUROBOND', 'MUTUAL FUNDS'
- **Smart Progress Tracking**:
  - **Unified USD Currency**: Automatically normalizes all assets (TRY) to USD for consistent target tracking
  - **Real-Time Visualization**: Dynamic circular progress charts (Pie Charts) and percentage bars
  - **Live Exchange Rate Integration**: Uses real-time USD/TRY rates to convert local assets 'on-the-fly'
- **Dashboard Summary**:
  - Total Target Value vs. Total Current Portfolio Value
  - Overall completion percentage
- **Management**:
  - Add, Edit, and Delete goals easily
  - Visual feedback on goal completion

### 🎨 Modern UI/UX
- Dark/Light theme support
- Responsive design for all devices
- Interactive charts and visualizations
- Intuitive asset and transaction management
- **Polished Inputs**: Clean numeric input fields preventing accidental value changes
- Toast notifications for user feedback
- **Cyberpunk Theme**: Exclusive high-contrast neon theme for immersive experience

## Tech Stack

### Frontend
- **Framework**: [Next.js 16](https://nextjs.org/) with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4
- **UI Components**: Radix UI primitives
- **Charts**: Recharts
- **Forms**: React Hook Form + Zod validation
- **Icons**: Lucide React

### Backend & Database
- **Authentication**: Firebase Auth
- **Database**: Cloud Firestore
- **Real-time Data**: Yahoo Finance 2 API

### State Management
- **Store**: Zustand for global state management

### Additional Libraries
- **Date Handling**: date-fns
- **Notifications**: Sonner
- **Theme**: next-themes
- **Currency Handling**: 
  - Live USD/TRY exchange rate fetching
  - Server Actions for secure API communication

## Getting Started

### Prerequisites
- Node.js 18+ installed
- npm, yarn, pnpm, or bun package manager
- Firebase project with Firestore and Authentication enabled

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd portfolio-tracker
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

3. **Set up environment variables**
   
   Create a `.env.local` file in the root directory with your Firebase configuration:
   ```env
   NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
   ```

4. **Run the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   ```

5. **Open your browser**
   
   Navigate to [http://localhost:3000](http://localhost:3000)

## Usage

### First Time Setup
1. Register a new account on the registration page
2. Log in with your credentials
3. You'll be redirected to the dashboard

### Adding Assets
1. Click the "Add Asset" button in the dashboard header
2. Select the asset category (BIST100, US Markets, or Precious Metals)
3. Enter the ticker symbol (e.g., THYAO for Turkish Airlines, AAPL for Apple)
4. Specify the quantity and purchase price
5. Click "Add Asset" to save

### Recording Transactions
1. Click the "Add Transaction" button
2. Select the transaction type:
   - **Buy**: Purchase additional shares
   - **Sell**: Sell existing shares
   - **Dividend**: Record dividend payments (no quantity/price needed, just total amount)
3. Choose the asset from your portfolio
4. Enter transaction details:
   - For Buy/Sell: quantity, price per share, and date
   - For Dividend: total dividend amount received and date
   - **Flexible Currency Conversion**: Automatic USD calculation using real-time rates, with the ability to manually adjust the exchange rate for historical accuracy.
5. Submit to record the transaction

### Viewing Portfolio
- Switch between tabs to view different market portfolios (Total, BIST100, US Markets, Precious Metals)
- View portfolio distribution in interactive pie charts:
  - Total tab shows both category distribution and individual market breakdowns
  - Hover over chart segments to see detailed value and percentage information
- Check current holdings in sortable tables:
  - Symbol, Quantity, Average Cost, Current Price, Total Value
  - **Dividends**: Track total dividends received per asset
  - Profit/Loss (including dividends) with percentage
- Review recent transactions (Buy/Sell/Dividend)
- Use the refresh button to update real-time prices

### Tracking Goals
1. Navigate to the **Goals** page via the target icon in the header
2. **Set a Target**:
   - Choose a category (e.g., US Stocks)
   - Enter your target amount in **USD**
3. **Monitor Progress**:
   - See your current progress bar and percentage
   - Assets in different currencies (e.g., BIST100 in TRY) are automatically converted to USD for unified tracking.

## Project Structure

```
portfolio-tracker/
├── src/
│   ├── app/
│   │   ├── (auth)/          # Authentication pages
│   │   │   ├── login/
│   │   │   └── register/
│   │   ├── analytics/       # Portfolio analytics page
│   │   ├── dashboard/       # Main dashboard page
│   │   ├── income-tracker/  # Income tracker page
│   │   ├── investment-tracker/ # Investment tracker page
│   │   ├── goals/           # Goals tracking page (New)
│   │   ├── actions/         # Server actions
│   │   ├── layout.tsx       # Root layout
│   │   ├── page.tsx         # Landing page
│   │   └── globals.css      # Global styles
│   ├── components/
│   │   ├── dashboard/       # Dashboard components
│   │   │   ├── tabs.tsx
│   │   │   ├── add-asset-dialog.tsx
│   │   │   ├── add-transaction-dialog.tsx
│   │   │   ├── portfolio-chart.tsx
│   │   │   ├── portfolio-table.tsx
│   │   │   ├── transactions-table.tsx
│   │   │   ├── summary-cards.tsx
│   │   │   ├── bist100-tab.tsx
│   │   │   ├── us-markets-tab.tsx
│   │   │   ├── precious-metals-tab.tsx
│   │   │   └── total-portfolio-tab.tsx
│   │   ├── income/          # Income tracker components
│   │   │   ├── add-income-dialog.tsx
│   │   │   ├── income-matrix.tsx
│   │   │   ├── income-history-table.tsx
│   │   │   └── income-details-dialog.tsx
│   │   ├── investment/      # Investment tracker components
│   │   │   ├── investment-tracker-matrix.tsx
│   │   │   └── investment-history-table.tsx
│   │   ├── goals/           # Goals components (New)
│   │   │   ├── add-goal-form.tsx
│   │   │   ├── goal-card.tsx
│   │   │   └── goals-page-content.tsx
│   │   ├── ui/              # Reusable UI components (Radix UI)
│   │   │   ├── alert-dialog.tsx
│   │   │   └── ...
│   │   ├── site-header.tsx  # Main navigation header
│   │   ├── mode-toggle.tsx  # Dark/Light theme toggle
│   │   └── theme-provider.tsx
│   ├── lib/
│   │   ├── firebase.ts      # Firebase configuration
│   │   ├── auth.ts          # Authentication utilities
│   │   ├── firestore.service.ts    # Firestore CRUD operations
│   │   ├── yahoo-finance.service.ts # Yahoo Finance API integration
│   │   ├── analytics-utils.ts      # Portfolio analytics calculations
│   │   ├── calculations.ts  # Financial calculations
│   │   ├── formatters.ts    # Number/currency formatters
│   │   └── utils.ts         # General helper functions
│   ├── store/
│   │   ├── portfolio.store.ts      # Portfolio state (Zustand)
│   │   └── transaction.store.ts    # Transaction state (Zustand)
│   ├── types/
│   │   ├── portfolio.types.ts      # Portfolio & transaction types
│   │   └── income.ts        # Income tracker types
│   └── middleware.ts        # Next.js middleware for auth
├── public/                  # Static assets
├── scripts/                 # Utility scripts
├── firestore.rules         # Firestore security rules
├── .env.local              # Environment variables (not in repo)
├── next.config.ts          # Next.js configuration
├── tailwind.config.ts      # Tailwind CSS configuration
├── tsconfig.json           # TypeScript configuration
└── package.json
```

## Building for Production

```bash
npm run build
npm run start
```

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## Firebase Setup

### Firestore Collections Structure

**portfolios** collection:
```
portfolios/{userId}/assets/{assetId}
- symbol: string
- category: 'bist100' | 'us' | 'precious_metals'
- quantity: number
- purchasePrice: number
- currentPrice: number
- createdAt: timestamp
```

**transactions** collection:
```
transactions/{userId}/history/{transactionId}
- type: 'buy' | 'sell' | 'dividend'
- symbol: string
- category: string
- quantity: number (0 for dividend transactions)
- price: number (0 for dividend transactions)
- total: number (total transaction amount or dividend received)
- date: timestamp
- date: timestamp
- createdAt: timestamp
```

**incomes** collection:
```
incomes/{incomeId}
- userId: string
- year: number
- month: number (0-11)
- amount: number
- category: string
- description: string (optional)
- company: string (optional, portfolio asset symbol)
- createdAt: timestamp

**goals** collection:
```
goals/{goalId}
- userId: string
- category: 'BIST100' | 'US STOCKS' | 'PRECIOUS METALS' | 'EUROBOND' | 'MUTUAL FUNDS'
- targetAmount: number (in USD)
- createdAt: timestamp
- updatedAt: timestamp
```
```

### Security Rules
Ensure your Firestore security rules are properly configured to protect user data.

## Contributing

This is a private project. Contributions are not currently being accepted.

## License

This project is private and proprietary. All rights reserved.

---

Built with ❤️ using Next.js and Firebase
