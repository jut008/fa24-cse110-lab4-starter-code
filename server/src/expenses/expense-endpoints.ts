import { createExpenseServer, deleteExpense, getExpenses } from "./expense-utils";
import { Express } from "express";

export function createExpenseEndpoints(app: Express) {
    app.post("/expenses", (req, res) => {
        createExpenseServer(req, res); // Call without passing an `expenses` argument
    });

    app.delete("/expenses/:id", (req, res) => {
        deleteExpense(req, res);
    });

    app.get("/expenses", (req, res) => {
        getExpenses(req, res);
    });
}