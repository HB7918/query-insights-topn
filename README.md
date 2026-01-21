# Query Insights - Top N Queries Dashboard

<!-- Main Branch Version -->

A React-based dashboard for analyzing and visualizing your most frequently executed database queries.

## Features

- **Top N Analysis**: View your top 5, 10, 25, 50, or 100 most frequent queries
- **Time Range Filtering**: Analyze queries from the last hour, 24 hours, 7 days, or 30 days
- **Dual View Modes**: 
  - Chart view with visual bars showing query frequency
  - Table view with detailed query information
- **Query Metrics**: See execution counts and average response times
- **Responsive Design**: Works on desktop and mobile devices

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open your browser to `http://localhost:5174`

### Building for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

## Usage

1. **Select Top N**: Choose how many top queries to display (5-100)
2. **Set Time Range**: Filter queries by time period
3. **Switch Views**: Toggle between chart and table views
4. **Analyze Results**: Review query patterns, execution counts, and performance metrics

## Deployment

This project is configured for AWS Amplify deployment with the included `amplify.yml` file.

## Technology Stack

- React 19
- Vite
- CSS3 with modern features
- Responsive design principles

## License

ISC