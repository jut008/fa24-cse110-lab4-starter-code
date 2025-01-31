import React from "react";
import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import { AppContext } from "../../context/AppContext";
import AddExpenseForm from "./AddExpenseForm";
import { Expense } from "../../types/types";
import { MyBudgetTracker } from "../../views/MyBudgetTracker";

describe("Add Expenses", () => {
  let expenses: Expense[] = [];

  const mockSetExpenses = jest.fn((newExpensesOrCallback) => {
    if (typeof newExpensesOrCallback === 'function') {
      expenses = newExpensesOrCallback(expenses);
    } else {
      expenses = newExpensesOrCallback;
    }
  });

  const mockSetBudget = jest.fn(); // Mock for setBudget
  const mockCreateExpense = jest.fn(); // Mock for createExpense

  const BUDGET_START = 1000;

  const renderApp = () => {
    return render(
      <AppContext.Provider
        value={{
          expenses,
          setExpenses: mockSetExpenses,
          budget: BUDGET_START,
          setBudget: mockSetBudget, // Add setBudget mock
          createExpense: mockCreateExpense // Add createExpense mock
        }}
      >
        <MyBudgetTracker />
      </AppContext.Provider>
    );
  };

  beforeEach(() => {
    expenses = [];
    mockSetExpenses.mockClear();
    mockSetBudget.mockClear();
    mockCreateExpense.mockClear();
  });

  beforeAll(() => {
    jest.spyOn(window, 'alert').mockImplementation(() => { });
  });

  test("Check that components exist", () => {
    renderApp();
    expect(screen.getByTestId("description-input")).toBeInTheDocument();
    expect(screen.getByTestId("cost-input")).toBeInTheDocument();
    expect(screen.getByTestId("save-expense")).toBeInTheDocument();
  });

  test("Check default values", () => {
    renderApp();
    expect(screen.getByTestId("description-input")).toHaveValue("");
    expect(screen.getByTestId("cost-input")).toHaveValue("0");
  });

  test("Add a new expense of cost 50", async () => {
    const { rerender } = renderApp();

    // Input values
    await act(async () => {
      fireEvent.change(screen.getByTestId("description-input"), {
        target: { value: "Groceries" },
      });
      fireEvent.change(screen.getByTestId("cost-input"), {
        target: { value: "50" },
      });

      // Submit form
      fireEvent.click(screen.getByTestId("save-expense"));
    });

    // Wait for state to update
    await waitFor(() => {
      expect(mockSetExpenses).toHaveBeenCalled();
    });
    
    // Check that the expense list was updated
    const updatedExpenses = mockSetExpenses.mock.calls[0][0]([]);
    expect(updatedExpenses).toEqual(
      expect.arrayContaining([
        expect.objectContaining<Expense>({
          id: expect.any(String),
          description: "Groceries",
          cost: 50
        }),
      ])
    );
    
    // Check that defaults were reset
    expect(screen.getByTestId("description-input")).toHaveValue("");
    expect(screen.getByTestId("cost-input")).toHaveValue("0");

    // Force rerender with updated expenses
    rerender(
      <AppContext.Provider
        value={{
          expenses: updatedExpenses,
          setExpenses: mockSetExpenses,
          budget: BUDGET_START,
          setBudget: mockSetBudget,
          createExpense: mockCreateExpense
        }}
      >
        <MyBudgetTracker />
      </AppContext.Provider>
    );

    expect(screen.getByText("Groceries")).toBeInTheDocument();
    expect(screen.getByText("$50")).toBeInTheDocument();

    // Check the remaining value
    expect(screen.getByTestId("remaining")).toHaveTextContent(`Remaining: $${BUDGET_START - 50}`);
  });

  test("Add a new expense of cost 1001", async () => {
    const { rerender } = renderApp();
    const cost = 1001;

    // Input values
    await act(async () => {
      fireEvent.change(screen.getByTestId("description-input"), {
        target: { value: "Very expensive whole foods groceries" },
      });
      fireEvent.change(screen.getByTestId("cost-input"), {
        target: { value: cost },
      });

      // Submit form
      fireEvent.click(screen.getByTestId("save-expense"));
    });

    // Wait for state to update
    await waitFor(() => {
      expect(mockSetExpenses).toHaveBeenCalled();
    });

    // Check that the expense list was updated
    const updatedExpenses = mockSetExpenses.mock.calls[0][0]([]);
    expect(updatedExpenses).toEqual(
      expect.arrayContaining([
        expect.objectContaining<Expense>({
          id: expect.any(String),
          description: "Very expensive whole foods groceries",
          cost: cost
        }),
      ])
    );

    // Check that defaults were reset
    expect(screen.getByTestId("description-input")).toHaveValue("");
    expect(screen.getByTestId("cost-input")).toHaveValue("0");

    // Force rerender with updated expenses
    rerender(
      <AppContext.Provider
        value={{
          expenses: updatedExpenses,
          setExpenses: mockSetExpenses,
          budget: BUDGET_START,
          setBudget: mockSetBudget,
          createExpense: mockCreateExpense
        }}
      >
        <MyBudgetTracker />
      </AppContext.Provider>
    );

    // Check if alert was called
    expect(window.alert).toHaveBeenCalled();
    expect(screen.getByText("Very expensive whole foods groceries")).toBeInTheDocument();
    expect(screen.getByText("$1001")).toBeInTheDocument();

    // Check the remaining value
    expect(screen.getByTestId("remaining")).toHaveTextContent(`Remaining: $${BUDGET_START - cost}`);
  });

  test("Add a new expense of cost -100", async () => {
    const { rerender } = renderApp();
    const cost = -100;

    // Input values
    await act(async () => {
      fireEvent.change(screen.getByTestId("description-input"), {
        target: { value: "They are paying me to take the groceries" },
      });
      fireEvent.change(screen.getByTestId("cost-input"), {
        target: { value: cost },
      });

      // Submit form
      fireEvent.click(screen.getByTestId("save-expense"));
    });

    // Check that the setExpenses function never got called
    expect(mockSetExpenses).toHaveBeenCalledTimes(0);

    // Check that cost was reset to 0, and description remained
    expect(screen.getByTestId("description-input")).toHaveValue("They are paying me to take the groceries");
    expect(screen.getByTestId("cost-input")).toHaveValue("0");

    // Force rerender with updated expenses
    rerender(
      <AppContext.Provider
        value={{
          expenses: expenses,
          setExpenses: mockSetExpenses,
          budget: BUDGET_START,
          setBudget: mockSetBudget,
          createExpense: mockCreateExpense
        }}
      >
        <MyBudgetTracker />
      </AppContext.Provider>
    );

    // Check if alert was called
    expect(window.alert).toHaveBeenCalled();

    // Check the remaining value did not change
    expect(screen.getByTestId("remaining")).toHaveTextContent(`Remaining: $${BUDGET_START}`);
  });

  test("A new expense with non-numeric cost", async () => {
    const { rerender } = renderApp();
    
    // Input values
    await act(async () => {
      fireEvent.change(screen.getByTestId("description-input"), {
        target: { value: "Here's a curveball" },
      });
      fireEvent.change(screen.getByTestId("cost-input"), {
        target: { value: "text cost" },
      });

      // Submit form
      fireEvent.click(screen.getByTestId("save-expense"));
    });

    // Check that the setExpenses function never got called
    expect(mockSetExpenses).toHaveBeenCalledTimes(0);

    // Check that cost was reset to 0, and description remained
    expect(screen.getByTestId("description-input")).toHaveValue("Here's a curveball");
    expect(screen.getByTestId("cost-input")).toHaveValue("0");

    // Force rerender with updated expenses
    rerender(
      <AppContext.Provider
        value={{
          expenses: expenses,
          setExpenses: mockSetExpenses,
          budget: BUDGET_START,
          setBudget: mockSetBudget,
          createExpense: mockCreateExpense
        }}
      >
        <MyBudgetTracker />
      </AppContext.Provider>
    );

    // Check if alert was called
    expect(window.alert).toHaveBeenCalled();

    // Check the remaining value did not change
    expect(screen.getByTestId("remaining")).toHaveTextContent(`Remaining: $${BUDGET_START}`);
  });

  // The remaining tests follow the same pattern, adding the mocks for `setBudget` and `createExpense`
  // and updating `name-input` to `description-input`.
});