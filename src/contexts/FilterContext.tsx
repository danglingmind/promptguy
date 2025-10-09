"use client"

import { createContext, useContext, useState, useCallback, ReactNode } from 'react'

export interface FilterParams {
  sortBy?: string
  order?: string
  purpose?: string
  search?: string
}

interface FilterContextType {
  filterParams: FilterParams
  setFilterParams: (params: FilterParams) => void
  applyFilter: (params: FilterParams) => void
  applySearch: (params: { search: string; model: string; purpose: string; sortBy: string; order: string }) => void
  resetFilters: () => void
}

const FilterContext = createContext<FilterContextType | undefined>(undefined)

export function FilterProvider({ children }: { children: ReactNode }) {
  const [filterParams, setFilterParams] = useState<FilterParams>({})

  const applyFilter = useCallback((params: FilterParams) => {
    setFilterParams(params)
  }, [])

  const applySearch = useCallback((params: { search: string; model: string; purpose: string; sortBy: string; order: string }) => {
    setFilterParams({
      search: params.search || undefined,
      purpose: params.purpose || undefined,
      sortBy: params.sortBy || undefined,
      order: params.order || undefined
    })
  }, [])

  const resetFilters = useCallback(() => {
    setFilterParams({})
  }, [])

  return (
    <FilterContext.Provider value={{
      filterParams,
      setFilterParams,
      applyFilter,
      applySearch,
      resetFilters
    }}>
      {children}
    </FilterContext.Provider>
  )
}

export function useFilters() {
  const context = useContext(FilterContext)
  if (context === undefined) {
    throw new Error('useFilters must be used within a FilterProvider')
  }
  return context
}
