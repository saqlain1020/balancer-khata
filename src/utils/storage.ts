import { Person } from "../types/bonds";

const STORAGE_KEY = "bond_data";

/**
 * Save bond data to localStorage
 */
export const saveBondData = (data: Person[]): void => {
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.error("Failed to save bond data to localStorage:", error);
    }
  }
};

/**
 * Load bond data from localStorage
 */
export const loadBondData = (): Person[] | null => {
  if (typeof window !== "undefined") {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (data) {
        return JSON.parse(data) as Person[];
      }
    } catch (error) {
      console.error("Failed to load bond data from localStorage:", error);
    }
  }
  return null;
};
