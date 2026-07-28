/**
 * API service for communicating with the backend
 */

import { Expense, ExpenseFormData } from "../types";

const API_BASE_URL = "http://localhost:3000/api";

/**
 * Fetch all expenses
 */
export async function fetchExpenses(): Promise<Expense[]> {
  const response = await fetch(`${API_BASE_URL}/expenses`);
  if (!response.ok) {
    throw new Error("Failed to fetch expenses");
  }
  return response.json();
}

/**
 * Fetch expenses for a specific year and month
 */
export async function getExpenses(
  year: number,
  month: number,
): Promise<Expense[]> {
  const response = await fetch(
    `${API_BASE_URL}/expenses?year=${year}&month=${month}`,
  );
  if (!response.ok) {
    throw new Error("Failed to fetch expenses");
  }
  return response.json();
}

let cachedCategories: Array<{ id: number; name: string }> | null = null;
let categoryFetchPromise: Promise<Array<{ id: number; name: string }>> | null = null;

/**
 * Fetch all categories (uses in-memory cache unless forceRefresh is true)
 */
export async function fetchCategories(
  forceRefresh = false
): Promise<Array<{ id: number; name: string }>> {
  if (!forceRefresh && cachedCategories) {
    return cachedCategories;
  }

  if (!forceRefresh && categoryFetchPromise) {
    return categoryFetchPromise;
  }

  categoryFetchPromise = (async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/categories`);
      if (!response.ok) {
        throw new Error("Failed to fetch categories");
      }
      const data = await response.json();
      cachedCategories = data;
      return data;
    } finally {
      categoryFetchPromise = null;
    }
  })();

  return categoryFetchPromise;
}

/**
 * Create a new category and refresh category cache
 */
export async function createCategory(data: {
  name: string;
}): Promise<{ id: number; name: string }> {
  const response = await fetch(`${API_BASE_URL}/categories`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ category: data }),
  });

  if (!response.ok) {
    throw new Error("Failed to create category");
  }

  const newCategory = await response.json();
  cachedCategories = null;
  return newCategory;
}

/**
 * Create a new expense
 */
export async function createExpense(data: ExpenseFormData): Promise<Expense> {
  // Convert category name to category_id
  const categories = await fetchCategories();
  const category = categories.find(
    (c) => c.name.trim().toLowerCase() === data.category.trim().toLowerCase()
  );

  const expenseData = {
    description: data.description,
    amount: data.amount,
    category_id: category?.id,
    date: data.date,
  };

  const response = await fetch(`${API_BASE_URL}/expenses`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ expense: expenseData }),
  });

  if (!response.ok) {
    throw new Error("Failed to create expense");
  }

  return response.json();
}

/**
 * Update an existing expense
 */
export async function updateExpense(
  id: number,
  data: Partial<ExpenseFormData>,
): Promise<Expense> {
  let category_id: number | undefined;

  if (data.category) {
    const categories = await fetchCategories();
    const targetCatName = data.category.trim().toLowerCase();
    const category = categories.find(
      (c) => c.name.trim().toLowerCase() === targetCatName
    );
    category_id = category?.id;
  }

  const expenseData: Record<string, unknown> = {};
  if (data.description !== undefined) expenseData.description = data.description;
  if (data.amount !== undefined) expenseData.amount = data.amount;
  if (data.date !== undefined) expenseData.date = data.date;
  if (category_id !== undefined) expenseData.category_id = category_id;

  const response = await fetch(`${API_BASE_URL}/expenses/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ expense: expenseData }),
  });

  if (!response.ok) {
    throw new Error("Failed to update expense");
  }

  return response.json();
}

/**
 * Delete an expense
 */
export async function deleteExpense(id: number): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/expenses/${id}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    throw new Error("Failed to delete expense");
  }
}
