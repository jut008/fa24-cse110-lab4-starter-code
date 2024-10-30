import React from "react";
import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import { AppContext } from "../../context/AppContext";
import AddExpenseForm from "./AddExpenseForm";
import App from "../../App";
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

  const BUDGET_START = 1000;

  const renderApp = () => {
    return render(
      <AppContext.Provider
        value={{
          expenses,
          setExpenses: mockSetExpenses,
          budget: BUDGET_START
        }}
      >
        <MyBudgetTracker />
      </AppContext.Provider>
    );
  };

  beforeEach(() => {
    expenses = [];
    mockSetExpenses.mockClear();
  });

  beforeAll(() => {
    jest.spyOn(window, 'alert').mockImplementation(() => { });
  });

  test("Check that components exist", () => {
    renderApp();
    expect(screen.getByTestId("name-input")).toBeInTheDocument();
    expect(screen.getByTestId("cost-input")).toBeInTheDocument();
    expect(screen.getByTestId("save-expense")).toBeInTheDocument();
  });

  test("Check default values", () => {
    renderApp();
    expect(screen.getByTestId("name-input")).toHaveValue("");
    expect(screen.getByTestId("cost-input")).toHaveValue("0");
  });

  test("Add a new expense of cost 50", async () => {
    const { rerender } = renderApp();

    // Input values
    await act(async () => {
      fireEvent.change(screen.getByTestId("name-input"), {
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
          name: "Groceries",
          cost: 50
        }),
      ])
    )
    // Check that defaults were reset
    expect(screen.getByTestId("name-input")).toHaveValue("");
    expect(screen.getByTestId("cost-input")).toHaveValue("0");

    // Force rerender with updated expenses
    rerender(
      <AppContext.Provider
        value={{
          expenses: updatedExpenses,
          setExpenses: mockSetExpenses,
          budget: BUDGET_START
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
      fireEvent.change(screen.getByTestId("name-input"), {
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
          name: "Very expensive whole foods groceries",
          cost: cost
        }),
      ])
    )
    // Check that defaults were reset
    expect(screen.getByTestId("name-input")).toHaveValue("");
    expect(screen.getByTestId("cost-input")).toHaveValue("0");

    // Force rerender with updated expenses
    rerender(
      <AppContext.Provider
        value={{
          expenses: updatedExpenses,
          setExpenses: mockSetExpenses,
          budget: BUDGET_START
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
      fireEvent.change(screen.getByTestId("name-input"), {
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
    // Check that cost was reset to 0, and name remained
    expect(screen.getByTestId("name-input")).toHaveValue("They are paying me to take the groceries");
    expect(screen.getByTestId("cost-input")).toHaveValue("0");

    // Force rerender with updated expenses
    rerender(
      <AppContext.Provider
        value={{
          expenses: expenses,
          setExpenses: mockSetExpenses,
          budget: BUDGET_START
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
      fireEvent.change(screen.getByTestId("name-input"), {
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
    // Check that cost was reset to 0, and name remained
    expect(screen.getByTestId("name-input")).toHaveValue("Here's a curveball");
    expect(screen.getByTestId("cost-input")).toHaveValue("0");

    // Force rerender with updated expenses
    rerender(
      <AppContext.Provider
        value={{
          expenses: expenses,
          setExpenses: mockSetExpenses,
          budget: BUDGET_START
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
  test("Add two expenses", async () => {
    const { rerender } = renderApp();

    // Add first expense
    await act(async () => {
      fireEvent.change(screen.getByTestId("name-input"), {
        target: { value: "Groceries" },
      });
      fireEvent.change(screen.getByTestId("cost-input"), {
        target: { value: "50" },
      });
      fireEvent.click(screen.getByTestId("save-expense"));
    });

    // Wait for first expense to be added
    await waitFor(() => {
      expect(mockSetExpenses).toHaveBeenCalled();
    });

    // Get updated expenses after first addition
    const firstExpenses = mockSetExpenses.mock.calls[0][0]([]);

    // Rerender with first expense
    rerender(
      <AppContext.Provider
        value={{
          expenses: firstExpenses,
          setExpenses: mockSetExpenses,
          budget: BUDGET_START
        }}
      >
        <MyBudgetTracker />
      </AppContext.Provider>
    );

    // Verify first expense is shown
    expect(screen.getByText("Groceries")).toBeInTheDocument();
    expect(screen.getByText("$50")).toBeInTheDocument();
    expect(screen.getByTestId("remaining")).toHaveTextContent(`Remaining: $${BUDGET_START - 50}`);

    // Add second expense
    await act(async () => {
      fireEvent.change(screen.getByTestId("name-input"), {
        target: { value: "Gas" },
      });
      fireEvent.change(screen.getByTestId("cost-input"), {
        target: { value: "30" },
      });
      fireEvent.click(screen.getByTestId("save-expense"));
    });

    // Wait for second expense to be added
    await waitFor(() => {
      expect(mockSetExpenses).toHaveBeenCalledTimes(2);
    });

    // Get final expenses after second addition
    const finalExpenses = mockSetExpenses.mock.calls[1][0](firstExpenses);

    // Rerender with both expenses
    rerender(
      <AppContext.Provider
        value={{
          expenses: finalExpenses,
          setExpenses: mockSetExpenses,
          budget: BUDGET_START
        }}
      >
        <MyBudgetTracker />
      </AppContext.Provider>
    );

    // Verify both expenses are shown
    expect(screen.getByText("Groceries")).toBeInTheDocument();
    expect(screen.getByText("$50")).toBeInTheDocument();
    expect(screen.getByText("Gas")).toBeInTheDocument();
    expect(screen.getByText("$30")).toBeInTheDocument();

    // Verify final remaining budget
    expect(screen.getByTestId("remaining")).toHaveTextContent(`Remaining: $${BUDGET_START - 80}`);
  });

  test("Add 100 expenses", async () => {
    const { rerender } = renderApp();
    const totalExpenses = 100;
    let currentExpenses: Expense[] = [];

    // Add 100 expenses
    for (let i = 1; i <= totalExpenses; i++) {
      await act(async () => {
        fireEvent.change(screen.getByTestId("name-input"), {
          target: { value: `Expense ${i}` },
        });
        fireEvent.change(screen.getByTestId("cost-input"), {
          target: { value: i },
        });

        fireEvent.click(screen.getByTestId("save-expense"));
      });

      // Wait for expense to be added
      await waitFor(() => {
        expect(mockSetExpenses).toHaveBeenCalledTimes(i);
      });

      // Get the updated list of expenses after each addition
      currentExpenses = mockSetExpenses.mock.calls[i - 1][0](currentExpenses);

      // Rerender with the updated expenses
      rerender(
        <AppContext.Provider
          value={{
            expenses: currentExpenses,
            setExpenses: mockSetExpenses,
            budget: BUDGET_START
          }}
        >
          <MyBudgetTracker />
        </AppContext.Provider>
      );

      // Verify that the new expense is displayed
      expect(screen.getByText(`Expense ${i}`)).toBeInTheDocument();
      expect(screen.getByText(`$${i}`)).toBeInTheDocument();

      // Verify the remaining budget is correctly updated
      const remainingBudget = BUDGET_START - (i * (i + 1))/2;

      expect(screen.getByTestId("remaining")).toHaveTextContent(`Remaining: $${remainingBudget}`);
    }

    // Verify all 100 expenses were added
    expect(currentExpenses.length).toBe(totalExpenses);
  });

});