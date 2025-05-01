import React from 'react';
interface TransactionModalProps {
    isOpen: boolean;
    onClose: () => void;
    initialType: 'income' | 'expense';
}
declare const TransactionModal: React.FC<TransactionModalProps>;
export default TransactionModal;
