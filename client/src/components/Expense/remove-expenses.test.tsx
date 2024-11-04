import React from "react";
import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import { AppContext } from "../../context/AppContext";
import AddExpenseForm from "./AddExpenseForm";
import { Expense } from "../../types/types";
import { MyBudgetTracker } from "../../views/MyBudgetTracker";

describe("Remove Expenses", () => {
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

    test("Add and remove one expense", async () => {
        const { rerender } = renderApp();

        // Simulate entering "Test Expense" as the expense description and "50" as the cost
        await act(async () => {
            fireEvent.change(screen.getByTestId("description-input"), {
                target: { value: "Test Expense" },
            });
            fireEvent.change(screen.getByTestId("cost-input"), {
                target: { value: 50 },
            });

            // Submit form
            fireEvent.click(screen.getByTestId("save-expense"));
        });

        // Force rerender with updated expenses
        let updatedExpenses = mockSetExpenses.mock.calls[0][0]([]);
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

        // Check that the expense is in the list
        expect(updatedExpenses).toEqual(
            expect.arrayContaining([
                expect.objectContaining<Expense>({
                    id: expect.any(String),
                    description: "Test Expense",
                    cost: 50
                }),
            ])
        );
        const id = updatedExpenses[0].id;

        // Check that the expense is on the screen
        expect(screen.getByText("Test Expense")).toBeInTheDocument();
        expect(screen.getByText("$50")).toBeInTheDocument();
        expect(screen.getByTestId(id)).toBeInTheDocument();

        // Simulate clicking the delete button for the added expense
        await act(async () => {
            fireEvent.click(screen.getByTestId(id));
        });

        updatedExpenses = mockSetExpenses.mock.calls[1][0]([]);

        expect(updatedExpenses.length).toBe(0);
        expect(updatedExpenses).not.toEqual(
            expect.arrayContaining([
                expect.objectContaining<Expense>({
                    id: expect.any(String),
                    description: "Test Expense",
                    cost: 50,
                }),
            ])
        );

        // Rerender after removal
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

        // Check that the expense is no longer in the DOM
        expect(screen.queryByText("Test Expense")).not.toBeInTheDocument();
        expect(screen.queryByText("$50")).not.toBeInTheDocument();
    });

    test("Add two expenses, remove one", async () => {
        const { rerender } = renderApp();

        // Add first expense
        await act(async () => {
            fireEvent.change(screen.getByTestId("description-input"), {
                target: { value: "First test" },
            });
            fireEvent.change(screen.getByTestId("cost-input"), {
                target: { value: 50 },
            });
            fireEvent.click(screen.getByTestId("save-expense"));
        });

        // Wait for first state update
        await waitFor(() => {
            expect(mockSetExpenses).toHaveBeenCalled();
        });

        let firstExpenses = mockSetExpenses.mock.calls[0][0]([]);

        // Rerender with first expense
        rerender(
            <AppContext.Provider
                value={{
                    expenses: firstExpenses,
                    setExpenses: mockSetExpenses,
                    budget: BUDGET_START,
                    setBudget: mockSetBudget,
                    createExpense: mockCreateExpense
                }}
            >
                <MyBudgetTracker />
            </AppContext.Provider>
        );

        // Add second expense
        await act(async () => {
            fireEvent.change(screen.getByTestId("description-input"), {
                target: { value: "Second test" },
            });
            fireEvent.change(screen.getByTestId("cost-input"), {
                target: { value: 100 },
            });
            fireEvent.click(screen.getByTestId("save-expense"));
        });

        // Wait for second state update
        await waitFor(() => {
            expect(mockSetExpenses).toHaveBeenCalledTimes(2);
        });

        // Get final state passing the previous expenses
        let finalExpenses = mockSetExpenses.mock.calls[1][0](firstExpenses);

        rerender(
            <AppContext.Provider
                value={{
                    expenses: finalExpenses,
                    setExpenses: mockSetExpenses,
                    budget: BUDGET_START,
                    setBudget: mockSetBudget,
                    createExpense: mockCreateExpense
                }}
            >
                <MyBudgetTracker />
            </AppContext.Provider>
        );

        // Verify both expenses exist in final state
        expect(finalExpenses).toEqual(
            expect.arrayContaining([
                expect.objectContaining<Expense>({
                    id: expect.any(String),
                    description: "First test",
                    cost: 50
                }),
                expect.objectContaining<Expense>({
                    id: expect.any(String),
                    description: "Second test",
                    cost: 100
                }),
            ])
        );

        // Also verify the elements are actually in the DOM
        expect(screen.getByText("First test")).toBeInTheDocument();
        expect(screen.getByText("$50")).toBeInTheDocument();
        expect(screen.getByText("Second test")).toBeInTheDocument();
        expect(screen.getByText("$100")).toBeInTheDocument();

        const firstExpenseId = finalExpenses[0].id;

        // Remove the first expense
        await act(async () => {
            fireEvent.click(screen.getByTestId(firstExpenseId)); // Click delete button
        });

        // Get updated expenses after removal
        const afterRemovalExpenses = mockSetExpenses.mock.calls[2][0](finalExpenses);

        rerender(
            <AppContext.Provider
                value={{
                    expenses: afterRemovalExpenses,
                    setExpenses: mockSetExpenses,
                    budget: BUDGET_START,
                    setBudget: mockSetBudget,
                    createExpense: mockCreateExpense
                }}
            >
                <MyBudgetTracker />
            </AppContext.Provider>
        );

        // Verify only one expense remains
        expect(afterRemovalExpenses.length).toBe(1);
        expect(afterRemovalExpenses).toEqual(
            expect.arrayContaining([
                expect.objectContaining<Expense>({
                    id: expect.any(String),
                    description: "Second test",
                    cost: 100
                }),
            ])
        );

        // Verify first expense is gone from DOM
        expect(screen.queryByText("First test")).not.toBeInTheDocument();
        expect(screen.queryByText("$50")).not.toBeInTheDocument();

        // Verify second expense is still there
        expect(screen.getByText("Second test")).toBeInTheDocument();
        expect(screen.getByText("$100")).toBeInTheDocument();
    });
});