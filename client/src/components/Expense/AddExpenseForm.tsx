import React, { useState, useContext } from "react";
import { AppContext } from "../../context/AppContext";
import { Expense } from "../../types/types";
import { createExpense, fetchExpenses } from "../../utils/expense-utils"; // Import createExpense and fetchExpenses
import { v4 as uuidv4 } from "uuid";

const AddExpenseForm = () => {
  const { setExpenses } = useContext(AppContext);
  const [name, setName] = useState("");
  const [cost, setCost] = useState<string>("0");

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    const newExpense: Expense = {
      id: uuidv4(),
      description: name,
      cost: parseFloat(cost),
    };

    try {
      // Add expense to the server
      await createExpense(newExpense);

      // Fetch updated expenses list from server
      const updatedExpenses = await fetchExpenses();
      setExpenses(updatedExpenses);
    } catch (error) {
      console.error("Failed to add expense:", error);
    }

    // Reset form fields
    setName("");
    setCost("0");
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Expense name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
      />
      <input
        type="number"
        placeholder="Cost"
        value={cost}
        onChange={(e) => setCost(e.target.value)}
        required
      />
      <button type="submit">Save</button>
    </form>
  );
};

export default AddExpenseForm;