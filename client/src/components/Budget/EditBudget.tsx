import { useState, useContext } from "react";
import { AppContext } from "../../context/AppContext";
import { updateBudget } from "../../utils/budget-utils";

const EditBudget = () => {
  const { budget, setBudget } = useContext(AppContext);
  const [newBudget, setNewBudget] = useState(budget);

  const handleUpdate = async () => {
    try {
      const updatedBudget = await updateBudget(newBudget);
      setBudget(updatedBudget); // Update context with the new budget
    } catch (error) {
      console.error("Failed to update budget:", error);
    }
  };

  return (
    <div>
      <h3>Edit Budget</h3>
      <input
        type="number"
        value={newBudget}
        onChange={(e) => setNewBudget(Number(e.target.value))}
      />
      <button onClick={handleUpdate}>Update Budget</button>
    </div>
  );
};

export default EditBudget;