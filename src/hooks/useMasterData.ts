import { useCallback, useEffect, useState } from "react";

import {
  getCategories,
  getCountries,
  getStates,
  getDistricts,
} from "@/api/master-data.api";

import type {
  CountryItem,
  DistrictItem,
  MasterDataItem,
  StateItem,
} from "@/types/master-data.types";

export function useMasterData() {
  const [categories, setCategories] = useState<MasterDataItem[]>([]);

  const [countries, setCountries] = useState<CountryItem[]>([]);

  const [states, setStates] = useState<StateItem[]>([]);

  const [districts, setDistricts] = useState<DistrictItem[]>([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState<string | null>(null);

  const loadMasterData = useCallback(async () => {
    try {
      setLoading(true);

      const [categoriesResponse, countriesResponse] = await Promise.all([
        getCategories(),
        getCountries(),
      ]);

      setCategories(categoriesResponse.data);
      setCountries(countriesResponse.data);

      setError(null);
    } catch (err) {
      console.error(err);

      setError("Unable to load master data.");
    } finally {
      setLoading(false);
    }
  }, []);

  const loadStates = useCallback(async (countryId: number) => {
    const response = await getStates(countryId);

    setStates(response.data);

    return response.data;
  }, []);

  const loadDistricts = useCallback(async (stateId: number) => {
    const response = await getDistricts(stateId);

    setDistricts(response.data);

    return response.data;
  }, []);

  useEffect(() => {
    const fetchMasterData = async () => {
      await loadMasterData();
    };

    void fetchMasterData();
  }, [loadMasterData]);

  return {
    categories,
    countries,
    states,
    districts,
    loading,
    error,
    refresh: loadMasterData,
    loadStates,
    loadDistricts,
  };
}
