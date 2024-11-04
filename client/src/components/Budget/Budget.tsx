import React, { useState, useContext } from "react";
import { AppContext } from "../../context/AppContext";
import { updateBudget, fetchBudget } from "../../utils/budget-utils";

const Budget = () => {
  const { budget, setBudget } = useContext(AppContext); // Access budget and setBudget from context
  const [newBudget, setNewBudget] = useState(budget); // Local state for the new budget value
  const [isEditing, setIsEditing] = useState(false); // State to toggle edit mode

  if (budget === null) {
    return null; // Do not render if the budget hasn't loaded
  }

  // Handle changes to the budget input
  const handleBudgetChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewBudget(parseFloat(e.target.value));
  };

  // Function to save the new budget and update the server
  const saveNewBudget = async () => {
    try {
      await updateBudget(newBudget); // Update the budget on the server
      const updatedBudget = await fetchBudget(); // Fetch the updated budget from the server
      setBudget(updatedBudget); // Update the budget in context with the server's response
    } catch (error) {
      console.error("Error updating budget:", error);
    }
    setIsEditing(false); // Exit edit mode
  };

  // Toggle between edit and view modes
  const toggleEditMode = () => {
    setIsEditing((prev) => !prev); // Toggle edit mode
    setNewBudget(budget); // Reset newBudget to current budget when editing starts
  };

  return (
    <div className="alert alert-secondary p-3 d-flex align-items-center justify-content-between">
      {isEditing ? (
        // Editable input for the budget with a save button
        <>
          <input
            type="number"
            value={newBudget}
            onChange={handleBudgetChange}
            className="form-control me-2"
            placeholder="Enter new budget"
          />
          <button className="btn btn-primary" onClick={saveNewBudget}>
            Save
          </button>
        </>
      ) : (
        // View mode with budget display and edit button
        <>
          <div>Budget: ${budget}</div>
          <button className="btn btn-primary" onClick={toggleEditMode}>
            Edit
          </button>
        </>
      )}
    </div>
  );
};

export default Budget;
