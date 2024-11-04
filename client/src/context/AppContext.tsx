import { createContext, useState, useEffect } from "react";
import { Expense } from "../types/types";
import { fetchBudget } from "../utils/budget-utils";

const BUDGET_DEFAULT = 1000;

interface AppContextType {
  expenses: Expense[];
  setExpenses: React.Dispatch<React.SetStateAction<Expense[]>>;
  budget: number;
  createExpense: (expense: Expense) => void;
  setBudget: React.Dispatch<React.SetStateAction<number>>;
}

const initialState: AppContextType = {
  expenses: [],
  setExpenses: () => {},
  budget: 0,
  setBudget: () => {},
  createExpense: () => {},
};

export const AppContext = createContext<AppContextType>(initialState);

export const AppProvider = (props: any) => {
  const [expenses, setExpenses] = useState<Expense[]>(initialState.expenses);
  const [budget, setBudget] = useState<number>(0);
  const [loading, setLoading] = useState(true); // New loading state

  const createExpense = (expense: Expense) => {
    setExpenses([...expenses, expense]);
  }

  useEffect(() => {
    const loadBudget = async () => {
      try {
        const fetchedBudget = await fetchBudget();
        setBudget(fetchedBudget);
      } catch (error) {
        console.error("Failed to fetch budget:", error);
      } finally {
        setLoading(false); // Set loading to false after fetching
      }
    };

    loadBudget();
  }, []);

  if (loading) {
    return <div>Loading...</div>; // Display a loading indicator while fetching the budget
  }

  return (
    <AppContext.Provider
      value={{
        expenses: expenses,
        setExpenses: setExpenses,
        budget: budget,
        createExpense: createExpense,
        setBudget: setBudget,
      }}
    >
      {props.children}
    </AppContext.Provider>
  );
};
