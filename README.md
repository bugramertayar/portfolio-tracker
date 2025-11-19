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

### 📈 Interactive Dashboard
- Portfolio distribution charts with Recharts
- Detailed holdings tables with current values
- Transaction history tracking
- Summary cards showing key metrics
- Refresh functionality for real-time updates

### 🎨 Modern UI/UX
- Dark/Light theme support
- Responsive design for all devices
- Interactive charts and visualizations
- Intuitive asset and transaction management
- Toast notifications for user feedback

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
2. Select the transaction type (Buy/Sell)
3. Choose the asset from your portfolio
4. Enter transaction details (quantity, price, date)
5. Submit to record the transaction

### Viewing Portfolio
- Switch between tabs to view different market portfolios
- View portfolio distribution in the pie chart
- Check current holdings and their values in the table
- Review recent transactions
- Use the refresh button to update real-time prices

## Project Structure

```
portfolio-tracker/
├── src/
│   ├── app/
│   │   ├── (auth)/          # Authentication pages
│   │   │   ├── login/
│   │   │   └── register/
│   │   ├── dashboard/       # Main dashboard
│   │   ├── actions/         # Server actions
│   │   └── layout.tsx       # Root layout
│   ├── components/
│   │   ├── dashboard/       # Dashboard components
│   │   │   ├── tabs.tsx
│   │   │   ├── portfolio-chart.tsx
│   │   │   ├── portfolio-table.tsx
│   │   │   ├── transactions-table.tsx
│   │   │   └── ...
│   │   └── ui/              # Reusable UI components
│   ├── lib/
│   │   ├── firebase.ts      # Firebase configuration
│   │   ├── auth.ts          # Authentication utilities
│   │   └── utils.ts         # Helper functions
│   └── store/
│       ├── portfolio.store.ts    # Portfolio state management
│       └── transaction.store.ts  # Transaction state management
├── public/                  # Static assets
├── .env.local              # Environment variables (not in repo)
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
- type: 'buy' | 'sell'
- symbol: string
- category: string
- quantity: number
- price: number
- date: timestamp
- createdAt: timestamp
```

### Security Rules
Ensure your Firestore security rules are properly configured to protect user data.

## Contributing

This is a private project. Contributions are not currently being accepted.

## License

This project is private and proprietary. All rights reserved.

---

Built with ❤️ using Next.js and Firebase
