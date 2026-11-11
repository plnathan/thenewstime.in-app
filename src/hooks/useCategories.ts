import { useCallback, useEffect, useState } from "react";

import { getCategories, type Category } from "@/api/category.api";

export function useCategories(enabled = true) {
  const [categories, setCategories] = useState<Category[]>([]);

  const [loading, setLoading] = useState(enabled);

  const [error, setError] = useState<string | null>(null);

  const loadCategories = useCallback(async () => {
    try {
      setLoading(true);

      const response = await getCategories();

      setCategories(response.data);

      setError(null);
    } catch (err) {
      console.error(err);

      setError("Unable to load categories.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!enabled) return;
    const fetchCategories = async () => {
      await loadCategories();
    };
    void fetchCategories();
  }, [enabled, loadCategories]);

  return {
    categories,
    loading,
    error,
    refresh: loadCategories,
  };
}
