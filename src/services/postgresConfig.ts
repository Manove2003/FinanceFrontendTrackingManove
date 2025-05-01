// PostgreSQL database configuration
// This file will be used by the backend developer to set up the database connection

export const postgresConfig = {
  host: process.env.POSTGRES_HOST || 'localhost',
  port: parseInt(process.env.POSTGRES_PORT || '5432'),
  user: process.env.POSTGRES_USER || 'postgres',
  password: process.env.POSTGRES_PASSWORD || 'postgres',
  database: process.env.POSTGRES_DB || 'finance_tracker',
  ssl: process.env.POSTGRES_SSL === 'true'
};

// Database schema - to be used by backend
export const dbSchema = {
  // Users table
  users: {
    id: 'UUID PRIMARY KEY',
    username: 'VARCHAR(100) NOT NULL',
    email: 'VARCHAR(255) UNIQUE NOT NULL',
    password: 'VARCHAR(255) NOT NULL', // Hashed password
    created_at: 'TIMESTAMP DEFAULT NOW()',
    updated_at: 'TIMESTAMP DEFAULT NOW()'
  },
  
  // Transactions table
  transactions: {
    id: 'UUID PRIMARY KEY',
    user_id: 'UUID REFERENCES users(id) ON DELETE CASCADE',
    type: 'VARCHAR(10) NOT NULL', // income or expense
    amount: 'DECIMAL(15,2) NOT NULL',
    category: 'VARCHAR(100) NOT NULL',
    date: 'DATE NOT NULL',
    description: 'TEXT',
    month: 'INTEGER NOT NULL', // 0-11 for Jan-Dec
    year: 'INTEGER NOT NULL',
    created_at: 'TIMESTAMP DEFAULT NOW()',
    updated_at: 'TIMESTAMP DEFAULT NOW()'
  },
  
  // Financial targets table
  targets: {
    id: 'UUID PRIMARY KEY',
    user_id: 'UUID REFERENCES users(id) ON DELETE CASCADE',
    name: 'VARCHAR(100) NOT NULL',
    amount: 'DECIMAL(15,2) NOT NULL',
    current: 'DECIMAL(15,2)',
    month: 'INTEGER NOT NULL', // 0-11 for Jan-Dec
    year: 'INTEGER NOT NULL',
    created_at: 'TIMESTAMP DEFAULT NOW()',
    updated_at: 'TIMESTAMP DEFAULT NOW()'
  },
  
  // Monthly summaries table
  monthly_summaries: {
    id: 'UUID PRIMARY KEY',
    user_id: 'UUID REFERENCES users(id) ON DELETE CASCADE',
    month: 'INTEGER NOT NULL', // 0-11 for Jan-Dec
    year: 'INTEGER NOT NULL',
    total_income: 'DECIMAL(15,2) NOT NULL DEFAULT 0',
    total_expenses: 'DECIMAL(15,2) NOT NULL DEFAULT 0',
    available_balance: 'DECIMAL(15,2) NOT NULL DEFAULT 0',
    net_worth: 'DECIMAL(15,2) NOT NULL DEFAULT 0',
    created_at: 'TIMESTAMP DEFAULT NOW()',
    updated_at: 'TIMESTAMP DEFAULT NOW()',
    UNIQUE: '(user_id, month, year)'
  }
};

// Sample queries for backend implementation
export const sampleQueries = {
  getUserTransactions: `
    SELECT * FROM transactions 
    WHERE user_id = $1 AND month = $2 AND year = $3 
    ORDER BY date DESC
  `,
  
  getUserTargets: `
    SELECT * FROM targets 
    WHERE user_id = $1 AND month = $2 AND year = $3
  `,
  
  getMonthlySummary: `
    SELECT * FROM monthly_summaries 
    WHERE user_id = $1 AND month = $2 AND year = $3
  `,
  
  createTransaction: `
    INSERT INTO transactions (id, user_id, type, amount, category, date, description, month, year)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    RETURNING *
  `,
  
  updateMonthlySummary: `
    INSERT INTO monthly_summaries (id, user_id, month, year, total_income, total_expenses, available_balance, net_worth)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    ON CONFLICT (user_id, month, year)
    DO UPDATE SET
      total_income = $5,
      total_expenses = $6,
      available_balance = $7,
      net_worth = $8,
      updated_at = NOW()
    RETURNING *
  `
};