import { useEffect, useRef, useState } from "react";
import { Expense, ExpenseFormData } from "../types";
import { createExpense, getExpenses } from "../services/api";

interface useExpensesProps {
    loading: boolean,
    fetchExpenses: (year: number, month: number) => Promise<void>,
    visibleExpenses: Expense[],
    handleAddExpense: (expense: ExpenseFormData) => Promise<void>,
}

export const useExpensesHistory = (selectedYear: number, selectedMonth: number, setIsModalOpen: React.Dispatch<React.SetStateAction<boolean>>, categories?: string[]): useExpensesProps => {
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [loading, setLoading] = useState(true);
    const fetchRequestId = useRef(0);

    const fetchExpenses = async (year: number, month: number) => {
        const requestId = ++fetchRequestId.current;

        try {
            setLoading(true);
            const data = await getExpenses(year, month);

            if (requestId === fetchRequestId.current) {
                setExpenses(data);
            }
        } catch (error) {
            console.error("Error fetching expenses:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchExpenses(selectedYear, selectedMonth);
    }, [selectedYear, selectedMonth]);


    const visibleExpenses =
        categories && categories.length > 0 ?
            expenses.filter((expense) => categories.includes(expense.category)) :
            expenses;

    const handleAddExpense = async (data: ExpenseFormData) => {
        try {
            await createExpense(data);
            setIsModalOpen(false);
            await fetchExpenses(selectedYear, selectedMonth);
        } catch (error) {
            console.error("Error creating expense:", error);
            throw error;
        }
    };

    return { loading, fetchExpenses, visibleExpenses, handleAddExpense };
}