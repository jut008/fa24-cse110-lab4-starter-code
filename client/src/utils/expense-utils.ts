import { API_BASE_URL } from "../constants/constants";
import { Expense } from "../types/types";

// Function to create an expense in the backend. Method: POST
export const createExpense = async (expense: Expense): Promise<Expense> => {
	const response = await fetch(`${API_BASE_URL}/expenses`, {
    	method: "POST",
    	headers: {
        	"Content-Type": "application/json",
    	},
    	body: JSON.stringify(expense),
	});
	if (!response.ok) {
    	throw new Error("Failed to create expense");
	}
	return response.json();
};

// Function to delete an expense in the backend. Method: DELETE
export const deleteExpense = async (id: string): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/expenses/${id}`, {
        method: "DELETE",
    });
    if (!response.ok) {
        throw new Error("Failed to delete expense");
    }
};

// Function to get all expenses from the backend. Method: GET
export const fetchExpenses = async () => {
    try {
      const response = await fetch("http://localhost:8080/expenses");
      if (!response.ok) {
        throw new Error("Failed to fetch expenses");
      }
      const data = await response.json();
      return data.data; // Assuming the server response structure is { data: [...] }
    } catch (error) {
      console.error("Error fetching expenses:", error);
      throw error;
    }
  };