import { Response } from "express";

let budgetAmount = 1000; // Initialize a default budget

// Function to get the current budget
export const getBudget = (res: Response) => {
  res.status(200).json({ budget: budgetAmount });
};

// Function to update the budget
export const updateBudget = (res: Response, body: any) => {
  const { amount } = body;
  if (typeof amount === "number" && amount > 0) {
    budgetAmount = amount;
    res.status(200).json({ budget: budgetAmount });
  } else {
    res.status(400).json({ error: "Invalid budget amount" });
  }
};