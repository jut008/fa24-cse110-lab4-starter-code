import React from "react";

interface ExpenseItemProps {
  id: string;
  description: string;
  cost: number;
  onDelete: () => void;
}

const ExpenseItem: React.FC<ExpenseItemProps> = ({ id, description, cost, onDelete }) => {
  return (
    <li className="list-group-item d-flex justify-content-between align-items-center">
      <span>
        {description}: ${cost}
      </span>
      <button onClick={onDelete} className="btn btn-danger btn-sm">
        X
      </button>
    </li>
  );
};

export default ExpenseItem;
