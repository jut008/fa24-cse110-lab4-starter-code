import { Request, Response } from "express";
import { createExpenseEndpoints } from "./expenses/expense-endpoints";
import { getBudget, updateBudget } from "./budget/budget-utils";

const express = require("express");
const cors = require("cors");

const app = express();
const port = 8080;

app.use(cors());
app.use(express.json());

// Start the server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});

// Root endpoint to test if the server is running
app.get("/", (req: Request, res: Response) => {
  res.send({ data: "Hello, TypeScript Express!" });
  res.status(200);
});

// Define the `/budget` GET endpoint
app.get("/budget", (req: Request, res: Response) => {
  getBudget(res);
});

// Define the `/budget` PUT endpoint
app.put("/budget", (req: Request, res: Response) => {
  updateBudget(res, req.body); // Pass `res` and `req.body` to updateBudget
});

// Initialize expense endpoints
createExpenseEndpoints(app);