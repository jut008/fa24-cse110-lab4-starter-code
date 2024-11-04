export const fetchBudget = async (): Promise<number> => {
    try {
      const response = await fetch("http://localhost:8080/budget");
      if (!response.ok) throw new Error("Failed to fetch budget");
      const data = await response.json();
      return data.budget;
    } catch (error) {
      console.error("Error fetching budget:", error);
      throw error;
    }
  };
  
  // Function to update the budget on the backend (PUT)
  export const updateBudget = async (budget: number): Promise<number> => {
    try {
      const response = await fetch("http://localhost:8080/budget", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ amount: budget }),
      });
      if (!response.ok) throw new Error("Failed to update budget");
  
      // Fetch the updated budget value after successfully updating
      const updatedResponse = await fetch("http://localhost:8080/budget");
      const data = await updatedResponse.json();
  
      return data.budget; // Return the updated budget from the response
    } catch (error) {
      console.error("Error updating budget:", error);
      throw error;
    }
  };