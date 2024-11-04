import ExpenseItem from "./ExpenseItem";
import { AppContext } from "../../context/AppContext";
import { useContext, useEffect } from "react";
import { Expense } from "../../types/types";
import { fetchExpenses, deleteExpense } from "../../utils/expense-utils"; // Make sure deleteExpense is imported

const ExpenseList = () => {
  const { expenses, setExpenses } = useContext(AppContext);

  // Function to load expenses from the server and update local state
  const loadExpenses = async () => {
    try {
      const expenseList = await fetchExpenses();
      setExpenses(expenseList);
    } catch (err: any) {
      console.error("Failed to load expenses:", err.message);
    }
  };

  // Function to delete an expense from server and update local state
  const handleDeleteExpense = async (id: string) => {
    try {
      await deleteExpense(id); // Delete from server
      setExpenses((prevExpenses) => prevExpenses.filter((expense) => expense.id !== id)); // Update local state
    } catch (err: any) {
      console.error("Failed to delete expense:", err.message);
    }
  };

  // Fetch expenses on component mount
  useEffect(() => {
    loadExpenses();
  }, [setExpenses]);

  return (
    <ul className="list-group">
      {expenses.map((expense: Expense) => (
        <ExpenseItem
          id={expense.id}
          description={expense.description}
          cost={expense.cost}
          key={expense.id}
          onDelete={() => handleDeleteExpense(expense.id)} // Pass delete handler to ExpenseItem
        />
      ))}
    </ul>
  );
};

export default ExpenseList;
