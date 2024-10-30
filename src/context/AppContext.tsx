import { createContext, useState } from "react";
import { Expense } from "../types/types";

// Exercise: Create add budget to the context
const BUDGET_DEFAULT = 1000;

interface AppContextType {
  expenses: Expense[];
  setExpenses: React.Dispatch<React.SetStateAction<Expense[]>>;
  budget: number;
}

const initialState: AppContextType = {
  expenses: [],
  setExpenses: () => {},
  budget: BUDGET_DEFAULT
};

export const AppContext = createContext<AppContextType>(initialState);

export const AppProvider = (props: any) => {
  const [expenses, setExpenses] = useState<Expense[]>(initialState.expenses);
  const budget = BUDGET_DEFAULT;
  return (
    <AppContext.Provider
      value={{
        expenses: expenses,
        setExpenses: setExpenses,
        budget: budget
      }}
    >
      {props.children}
    </AppContext.Provider>
  );
};
