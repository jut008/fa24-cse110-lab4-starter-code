import React, { useState, useContext } from "react";
import { AppContext } from "../../context/AppContext";
import { Expense } from "../../types/types";
import { v4 as uuidv4 } from 'uuid';

const AddExpenseForm = () => {
  const { expenses, setExpenses } = useContext(AppContext);

  const [name, setName] = useState("");
  const [cost, setCost] = useState<string>("0"); // Keep cost as string during input

  const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const parsedCost = parseFloat(cost); // Parse string to float here
    if (isNaN(parsedCost) || parsedCost <= 0) {
      window.alert("Please enter a valid positive cost");
      setCost("0");
      return;
    }

    const newExpense: Expense = {
      id: uuidv4(),
      name: name,
      cost: parsedCost,
    };

    setExpenses((prevExpenses) => [...prevExpenses, newExpense]);
    setName("");
    setCost("0");
  };

  const handleNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setName(event.target.value);
  };

  const handleCostChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;

    // Allow empty input, digits, or valid decimals
    if (/^-?\d*\.?\d*$/.test(value)) {
      setCost(value);
    }
  };

  return (
    <form onSubmit={onSubmit}>
      <div className="row">
        <div className="col-sm">
          <label htmlFor="name">Name</label>
          <input
            required
            type="text"
            className="form-control"
            id="name"
            data-testid="name-input"
            value={name}
            onChange={handleNameChange}
          />
        </div>
        <div className="col-sm">
          <label htmlFor="cost">Cost</label>
          <input
            required
            type="text"
            placeholder='0'
            className="form-control"
            id="cost-input"
            data-testid="cost-input"
            value={cost}
            onChange={handleCostChange}
          />
        </div>
        <div className="col-sm">
          <button
            type="submit"
            className="btn btn-primary mt-3"
            data-testid="save-expense"
          >
            Save
          </button>
        </div>
      </div>
    </form>
  );
};

export default AddExpenseForm;
