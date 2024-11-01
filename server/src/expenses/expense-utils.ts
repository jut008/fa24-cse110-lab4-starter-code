import { expenses, getNextExpenseId } from "../constants";
import { Request, Response } from "express";
import { Expense } from "../types"; // Adjust this import to your project structure

export function createExpenseServer(req: Request, res: Response) {
    const { description, cost } = req.body;

    if (!description || cost === undefined) {
        return res.status(400).send({ error: "Missing required fields" });
    }

    const newExpense: Expense = {
        id: getNextExpenseId().toString(), // Convert id to string
        description,
        cost,
    };

    expenses.push(newExpense);
    res.status(201).send(newExpense);
}

export function deleteExpense(req: Request, res: Response) {
    const { id } = req.params;

    const index = expenses.findIndex((expense) => expense.id === id);

    if (index === -1) { 
        return res.status(404).send({ error: "Expense not found" });
    }

    expenses.splice(index, 1); // Remove the expense from the array
    res.status(200).send({ message: "Expense deleted successfully" });
}

export function getExpenses(req: Request, res: Response) {
    res.status(200).send({ data: expenses }); // Send the current expenses array
}