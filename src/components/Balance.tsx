import { Coins } from 'lucide-react';
import { useFinance } from '../contexts/FinanceContext';
import { useAuth } from '../contexts/AuthContext';
import { useState, useEffect, useRef } from 'react';

function Balance() {
    const { summary, transactions, currentMonth, currentYear } = useFinance();
    
    // Use a ref to store the last valid balance
    const lastValidBalance = useRef(!isNaN(Number(summary?.availableBalance)) ? Number(summary?.availableBalance) : 0);
    
    // Add local state with initial value from localStorage if available
    const [balanceValue, setBalanceValue] = useState(() => {
        // Try to get from localStorage first
        const storedBalance = localStorage.getItem('financeTrackerBalance');
        if (storedBalance) {
            const parsedBalance = parseFloat(storedBalance);
            return !isNaN(parsedBalance) ? parsedBalance : lastValidBalance.current;
        }
        return lastValidBalance.current;
    });
    
    const { user } = useAuth();
    
    // Update local state whenever summary changes
    useEffect(() => {
        // Ensure we're working with valid number values
        const availableBalance = !isNaN(Number(summary?.availableBalance)) ? Number(summary?.availableBalance) : null;
        
        // Only update if we have a valid balance
        if (availableBalance !== null) {
            console.log('Balance component - valid summary updated:', availableBalance);
            
            // Store in ref for persistence
            lastValidBalance.current = availableBalance;
            
            // Update local storage
            localStorage.setItem('financeTrackerBalance', availableBalance.toString());
            
            // Update state
            setBalanceValue(availableBalance);
        } else if (lastValidBalance.current) {
            // If current is invalid but we have a stored value, use that
            console.log('Using last valid balance:', lastValidBalance.current);
            setBalanceValue(lastValidBalance.current);
        }
    }, [summary, transactions, currentMonth, currentYear]);

    return (
        <section className="bg-[#1E2A44] flex flex-row justify-between items-center border-gray-600 border my-6 mx-4 sm:mx-8 p-4 gap-4 rounded-xl">
            <div className="text-left w-full">
                <div>
                    <h2 className="text-base sm:text-lg font-semibold text-white">
                        Hey @{user?.username || 'User'}, Welcome Back!
                    </h2>
                    <p className="text-xs sm:text-sm text-gray-400">Your financial journey awaits—let's make it amazing!</p>
                </div>
                <div className="flex justify-between items-center gap-4 mt-4">
                    <span className="text-2xl sm:text-3xl font-bold text-white">
                        USD {(balanceValue || 0).toLocaleString()}
                    </span>
                    <div className="mr-0 sm:mr-5">
                        <Coins className="h-12 w-12 sm:h-16 sm:w-16 text-yellow-500" />
                    </div>
                </div>
            </div>
        </section>
    );
}

export default Balance;