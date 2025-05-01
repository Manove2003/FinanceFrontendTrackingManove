export declare const postgresConfig: {
    host: string;
    port: number;
    user: string;
    password: string;
    database: string;
    ssl: boolean;
};
export declare const dbSchema: {
    users: {
        id: string;
        username: string;
        email: string;
        password: string;
        created_at: string;
        updated_at: string;
    };
    transactions: {
        id: string;
        user_id: string;
        type: string;
        amount: string;
        category: string;
        date: string;
        description: string;
        month: string;
        year: string;
        created_at: string;
        updated_at: string;
    };
    targets: {
        id: string;
        user_id: string;
        name: string;
        amount: string;
        current: string;
        month: string;
        year: string;
        created_at: string;
        updated_at: string;
    };
    monthly_summaries: {
        id: string;
        user_id: string;
        month: string;
        year: string;
        total_income: string;
        total_expenses: string;
        available_balance: string;
        net_worth: string;
        created_at: string;
        updated_at: string;
        UNIQUE: string;
    };
};
export declare const sampleQueries: {
    getUserTransactions: string;
    getUserTargets: string;
    getMonthlySummary: string;
    createTransaction: string;
    updateMonthlySummary: string;
};
