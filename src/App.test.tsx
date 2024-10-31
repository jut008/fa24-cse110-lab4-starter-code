import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';

test('renders website title', () => {
  render(<App />);
  const title = screen.getByText(/^My Budget Planner$/i);
  expect(title).toBeInTheDocument();
});
