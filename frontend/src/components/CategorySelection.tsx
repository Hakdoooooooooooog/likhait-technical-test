import { useEffect, useMemo, useState } from "react";
import { COLORS } from "../constants/colors";
import { fetchCategories } from "../services/api";

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

  useEffect(() => {
    let isMounted = true;

    async function loadCategories() {
      try {
        const fetchedCategories = await fetchCategories();
        if (isMounted) {
          setCategories(fetchedCategories);
        }
      } catch (error) {
        console.error("Error fetching categories:", error);
        if (isMounted) {
          setCategories([]);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadCategories();

    return () => {
      isMounted = false;
    };
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
    border: `1px solid ${COLORS.border}`,
    borderRadius: "0.6rem",
    backgroundColor: COLORS.background.main,
    color: COLORS.text.primary,
    cursor: "pointer",
    transition: "background-color 0.15s ease, border-color 0.15s ease",
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

  return (
    <div style={containerStyle}>
      <div>
        <p style={titleStyle}>Categories</p>
        <p style={helperStyle}>Select one or more categories.</p>
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
                  style={{ margin: 0 }}
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
    </div>
  );
}
