import { useEffect, useMemo, useState } from "react";
import { COLORS } from "../constants/colors";
import { Button, Modal, TextField } from "../vibes";
import { createCategory, fetchCategories } from "../services/api";

interface CategorySelectionProps {
  selectedCategories?: string[];
  onSelectedCategoriesChange?: (categories: string[]) => void;
}

export default function CategorySelection({
  selectedCategories: selectedCategoriesProp,
  onSelectedCategoriesChange,
}: CategorySelectionProps) {
  const [categories, setCategories] = useState<
    Array<{ id: number; name: string }>
  >([]);
  const [loading, setLoading] = useState(true);
  const [internalSelectedCategories, setInternalSelectedCategories] = useState<
    string[]
  >([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [createError, setCreateError] = useState("");

  const loadCategories = async () => {
    try {
      const fetchedCategories = await fetchCategories();
      setCategories(fetchedCategories);
    } catch (error) {
      console.error("Error fetching categories:", error);
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const visibleCategories = useMemo(() => {
    return categories;
  }, [categories]);

  const selectedCategories =
    selectedCategoriesProp ?? internalSelectedCategories;

  const toggleCategory = (categoryName: string) => {
    const updateSelectedCategories = (current: string[]) =>
      current.includes(categoryName)
        ? current.filter((selected) => selected !== categoryName)
        : [...current, categoryName];

    if (onSelectedCategoriesChange) {
      onSelectedCategoriesChange(updateSelectedCategories(selectedCategories));
      return;
    }

    setInternalSelectedCategories((current) =>
      updateSelectedCategories(current),
    );
  };

  const containerStyle: React.CSSProperties = {
    display: "flex",
    flexDirection: "column",
    gap: "0.75rem",
    padding: "1rem",
    border: `1px solid ${COLORS.border}`,
    borderRadius: "0.75rem",
    backgroundColor: COLORS.background.card,
  };

  const headerStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: "1rem",
  };

  const headerTextStyle: React.CSSProperties = {
    display: "flex",
    flexDirection: "column",
    gap: "0.25rem",
  };

  const titleStyle: React.CSSProperties = {
    margin: 0,
    fontSize: "1rem",
    fontWeight: 600,
    color: COLORS.text.primary,
  };

  const helperStyle: React.CSSProperties = {
    margin: 0,
    fontSize: "0.875rem",
    color: COLORS.text.secondary,
  };

  const gridStyle: React.CSSProperties = {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
    gap: "0.5rem",
  };

  const labelStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
    padding: "0.65rem 0.75rem",
    backgroundColor: COLORS.background.main,
    color: COLORS.text.primary,
    cursor: "pointer",
    borderRadius: "0.6rem",
    boxShadow: "inset 0 0 0 1px transparent",
    transition: "background-color 0.15s ease",
  };

  const selectedStyle: React.CSSProperties = {
    backgroundColor: COLORS.primary.p01,
  };

  const chipsStyle: React.CSSProperties = {
    display: "flex",
    flexWrap: "wrap",
    gap: "0.5rem",
  };

  const chipStyle: React.CSSProperties = {
    padding: "0.35rem 0.65rem",
    borderRadius: "999px",
    backgroundColor: COLORS.primary.p02,
    color: COLORS.primary.p09,
    fontSize: "0.875rem",
  };

  const loadingStyle: React.CSSProperties = {
    padding: "0.75rem 0",
    color: COLORS.text.secondary,
    fontSize: "0.875rem",
  };

  const emptyStateStyle: React.CSSProperties = {
    padding: "0.75rem 0",
    color: COLORS.text.secondary,
    fontSize: "0.875rem",
  };

  const modalActionsStyle: React.CSSProperties = {
    display: "flex",
    gap: "0.75rem",
    justifyContent: "flex-end",
    marginTop: "1rem",
  };

  const inputStyle: React.CSSProperties = {
    outline: "none",
    boxShadow: "none",
    border: `1px solid ${COLORS.border}`,
    borderRadius: "0.5rem",
    padding: "0.5rem 0.75rem",
    fontSize: "1rem",
    width: "100%",
  };

  const handleCreateCategory = async () => {
    const trimmedName = newCategoryName.trim();

    if (!trimmedName) {
      setCreateError("Category name is required.");
      return;
    }

    try {
      setIsCreating(true);
      setCreateError("");
      await createCategory({ name: trimmedName });
      await loadCategories();
      setNewCategoryName("");
      setIsCreateModalOpen(false);
    } catch (error) {
      console.error("Error creating category:", error);
      setCreateError("Unable to create category. Try a different name.");
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div style={containerStyle}>
      <div style={headerStyle}>
        <div style={headerTextStyle}>
          <p style={titleStyle}>Categories</p>
          <p style={helperStyle}>Select one or more categories.</p>
        </div>

        <Button variant="secondary" onClick={() => setIsCreateModalOpen(true)}>
          Add Category
        </Button>
      </div>

      {loading ? (
        <div style={loadingStyle}>Loading categories...</div>
      ) : visibleCategories.length > 0 ? (
        <div style={gridStyle} role="group" aria-label="Select categories">
          {visibleCategories.map((category) => {
            const isSelected = selectedCategories.includes(category.name);

            return (
              <label
                key={category.id}
                style={{
                  ...labelStyle,
                  ...(isSelected ? selectedStyle : {}),
                }}
              >
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => toggleCategory(category.name)}
                  style={{ margin: 0, outline: "none", boxShadow: "none" }}
                />
                <span>{category.name}</span>
              </label>
            );
          })}
        </div>
      ) : (
        <div style={emptyStateStyle}>No categories available.</div>
      )}

      {selectedCategories.length > 0 && (
        <div style={chipsStyle} aria-label="Selected categories">
          {selectedCategories.map((category) => (
            <span key={category} style={chipStyle}>
              {category}
            </span>
          ))}
        </div>
      )}

      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => {
          setIsCreateModalOpen(false);
          setCreateError("");
        }}
        title="Add Category"
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <TextField
            label="Category name"
            placeholder="Enter a new category name"
            value={newCategoryName}
            onChange={(event) => setNewCategoryName(event.target.value)}
            error={createError}
            autoFocus
            fullWidth
            style={inputStyle}
          />

          <div style={modalActionsStyle}>
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setIsCreateModalOpen(false);
                setCreateError("");
              }}
              disabled={isCreating}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="primary"
              onClick={handleCreateCategory}
              disabled={isCreating}
            >
              {isCreating ? "Creating..." : "Create Category"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
