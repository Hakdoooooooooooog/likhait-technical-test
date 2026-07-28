/**
 * Calendar expense table component
 */

import React, { useState } from "react";
import { Expense, ExpenseFormData } from "../types";
import { formatCurrency, formatDate } from "../utils/expenseUtils";
import { getCategoryEmoji } from "../constants/categoryEmojis";
import { COLORS } from "../constants/colors";
import { Button, Modal, Pagination } from "../vibes";
import { ExpenseForm } from "./ExpenseForm.tsx";
import { usePagination } from "../hooks/usePagination";

interface CalendarExpenseTableProps {
  expenses: Expense[];
  onUpdateExpense: (id: number, data: Partial<ExpenseFormData>) => Promise<void>;
  onDeleteExpense: (id: number) => Promise<void>;
}

const ITEMS_PER_PAGE = 10;

export function CalendarExpenseTable({
  expenses,
  onUpdateExpense,
  onDeleteExpense,
}: CalendarExpenseTableProps) {
  const {
    currentItems: currentExpenses,
    currentPage,
    totalPages,
    setCurrentPage,
  } = usePagination(expenses, ITEMS_PER_PAGE);

  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [deletingExpense, setDeletingExpense] = useState<Expense | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const handleEdit = (expense: Expense) => {
    setEditingExpense(expense);
    setIsEditModalOpen(true);
  };

  const handleDelete = (expense: Expense) => {
    setDeletingExpense(expense);
    setDeleteError(null);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!deletingExpense) return;
    setIsDeleting(true);
    setDeleteError(null);
    try {
      await onDeleteExpense(deletingExpense.id);
      setIsDeleteModalOpen(false);
      setDeletingExpense(null);
    } catch (error) {
      console.error("Failed to delete expense:", error);
      setDeleteError("Failed to delete expense. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleUpdate = async (data: ExpenseFormData) => {
    if (!editingExpense) return;
    try {
      await onUpdateExpense(editingExpense.id, data);
      setIsEditModalOpen(false);
      setEditingExpense(null);
    } catch (error) {
      console.error("Failed to update expense:", error);
      throw error;
    }
  };

  const tableStyle: React.CSSProperties = {
    width: "100%",
    borderCollapse: "collapse",
    backgroundColor: COLORS.background.main,
    borderRadius: "0.5rem",
    overflow: "hidden",
    border: `1px solid ${COLORS.border}`,
  };

  const theadStyle: React.CSSProperties = {
    backgroundColor: COLORS.background.card,
  };

  const thStyle: React.CSSProperties = {
    padding: "0.75rem",
    textAlign: "left",
    fontWeight: 600,
    color: COLORS.text.primary,
    borderBottom: `2px solid ${COLORS.border}`,
  };

  const tdStyle: React.CSSProperties = {
    padding: "0.75rem",
    borderBottom: `1px solid ${COLORS.border}`,
    color: COLORS.text.primary,
  };

  const emptyStyle: React.CSSProperties = {
    padding: "2rem",
    textAlign: "center",
    color: COLORS.text.secondary,
  };

  const actionButtonsStyle: React.CSSProperties = {
    display: "flex",
    gap: "0.5rem",
  };

  if (expenses.length === 0) {
    return (
      <div style={tableStyle}>
        <div style={emptyStyle}>
          No expenses found. Add your first expense to get started!
        </div>
      </div>
    );
  }

  return (
    <>
      <table style={tableStyle}>
        <thead style={theadStyle}>
          <tr>
            <th style={thStyle}>Date</th>
            <th style={thStyle}>Description</th>
            <th style={thStyle}>Category</th>
            <th style={thStyle}>Amount</th>
            <th style={{ ...thStyle, textAlign: "center" }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {currentExpenses.map((expense) => (
            <tr key={expense.id}>
              <td style={tdStyle}>{formatDate(new Date(expense.date))}</td>
              <td style={tdStyle}>{expense.description}</td>
              <td style={tdStyle}>
                <span
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                  }}
                >
                  <span>{getCategoryEmoji(expense.category)}</span>
                  <span>{expense.category}</span>
                </span>
              </td>
              <td style={{ ...tdStyle, textAlign: "left", fontWeight: 600 }}>
                {formatCurrency(expense.amount)}
              </td>
              <td style={{ ...tdStyle, textAlign: "center" }}>
                <div style={actionButtonsStyle}>
                  <Button
                    variant="secondary"
                    size="small"
                    onClick={() => handleEdit(expense)}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="danger"
                    size="small"
                    onClick={() => handleDelete(expense)}
                  >
                    Delete
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />

      <Modal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingExpense(null);
        }}
        title="Edit Expense"
      >
        {editingExpense && (
          <ExpenseForm
            initialData={{
              amount: editingExpense.amount.toString(),
              description: editingExpense.description,
              category: editingExpense.category,
              date: editingExpense.date ? editingExpense.date.split("T")[0] : formatDate(new Date()),
            }}
            onSubmit={handleUpdate}
            onCancel={() => {
              setIsEditModalOpen(false);
              setEditingExpense(null);
            }}
            submitLabel="Update Expense"
          />
        )}
      </Modal>

      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          if (isDeleting) return;
          setIsDeleteModalOpen(false);
          setDeletingExpense(null);
          setDeleteError(null);
        }}
        title="Delete Expense"
      >
        <div style={{ padding: "1rem 0" }}>
          <p style={{ marginBottom: "1.5rem", color: COLORS.text.primary }}>
            Are you sure you want to delete this expense?
          </p>
          {deletingExpense && (
            <p style={{ marginBottom: "1.5rem", color: COLORS.text.secondary }}>
              <strong>{deletingExpense.description}</strong> -{" "}
              {formatCurrency(deletingExpense.amount)}
            </p>
          )}
          {deleteError && (
            <p style={{ marginBottom: "1rem", color: COLORS.text.secondary, fontSize: "0.875rem" }}>
              {deleteError}
            </p>
          )}
          <div
            style={{
              display: "flex",
              gap: "0.5rem",
              justifyContent: "flex-end",
            }}
          >
            <Button
              variant="secondary"
              disabled={isDeleting}
              onClick={() => {
                setIsDeleteModalOpen(false);
                setDeletingExpense(null);
                setDeleteError(null);
              }}
            >
              Cancel
            </Button>
            <Button variant="danger" disabled={isDeleting} onClick={confirmDelete}>
              {isDeleting ? "Deleting..." : "Delete"}
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
