import { Expense } from "./types";

// These values will be set every time the server starts
export let expenses: Expense[] = [
    { id: "1", description: "Groceries", cost: 100 },
    { id: "2", description: "Gas", cost: 50 },
];

export let budget = { "amount": 1000 };
export let expenseIdCounter = expenses.length;
export function getNextExpenseId() {
    return ++expenseIdCounter;
}