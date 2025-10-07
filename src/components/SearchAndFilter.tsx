"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Search, Filter, X } from 'lucide-react'

const modelOptions = [
  'GPT-4',
  'GPT-3.5',
  'Claude-3',
  'Claude-2',
  'Gemini Pro',
  'Stable Diffusion',
  'Midjourney',
  'DALL-E'
]

const purposeOptions = [
  'Code Review',
  'Creative Writing',
  'Data Analysis',
  'Image Generation',
  'Productivity',
  'Learning',
  'Research',
  'Marketing'
]

const sortOptions = [
  { value: 'createdAt', label: 'Latest' },
  { value: 'likesCount', label: 'Most Liked' },
  { value: 'bookmarksCount', label: 'Most Bookmarked' },
  { value: 'viewsCount', label: 'Most Viewed' }
]

interface SearchAndFilterProps {
  onSearch: (params: {
    search: string
    model: string
    purpose: string
    sortBy: string
    order: string
  }) => void
}

export function SearchAndFilter({ onSearch }: SearchAndFilterProps) {
  const [search, setSearch] = useState('')
  const [selectedModel, setSelectedModel] = useState('')
  const [selectedPurpose, setSelectedPurpose] = useState('')
  const [sortBy, setSortBy] = useState('createdAt')
  const [order, setOrder] = useState('desc')
  const [showFilters, setShowFilters] = useState(false)

  const handleSearch = () => {
    onSearch({
      search,
      model: selectedModel,
      purpose: selectedPurpose,
      sortBy,
      order
    })
  }

  const clearFilters = () => {
    setSearch('')
    setSelectedModel('')
    setSelectedPurpose('')
    setSortBy('createdAt')
    setOrder('desc')
    onSearch({
      search: '',
      model: '',
      purpose: '',
      sortBy: 'createdAt',
      order: 'desc'
    })
  }

  const hasActiveFilters = search || selectedModel || selectedPurpose || sortBy !== 'createdAt' || order !== 'desc'

  return (
    <Card className="mb-4 md:mb-6">
      <CardContent className="p-3 md:p-4">
        <div className="space-y-3 md:space-y-4">
          {/* Search Bar */}
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search prompts..."
                className="pl-10 text-sm md:text-base"
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleSearch} className="flex-1 sm:flex-none text-sm">
                Search
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className="flex-1 sm:flex-none text-sm"
              >
                <Filter className="h-4 w-4 mr-1 md:mr-2" />
                <span className="hidden sm:inline">Filters</span>
                <span className="sm:hidden">Filter</span>
                {hasActiveFilters && (
                  <span className="ml-1 md:ml-2 h-2 w-2 rounded-full bg-blue-500" />
                )}
              </Button>
            </div>
          </div>

          {/* Advanced Filters */}
          {showFilters && (
            <div className="space-y-4 pt-3 md:pt-4 border-t">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
                {/* Model Filter */}
                <div>
                  <label className="block text-xs md:text-sm font-medium mb-1 md:mb-2">
                    AI Model
                  </label>
                  <select
                    value={selectedModel}
                    onChange={(e) => setSelectedModel(e.target.value)}
                    className="w-full p-2 text-sm border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                  >
                    <option value="">All Models</option>
                    {modelOptions.map((model) => (
                      <option key={model} value={model}>{model}</option>
                    ))}
                  </select>
                </div>

                {/* Purpose Filter */}
                <div>
                  <label className="block text-xs md:text-sm font-medium mb-1 md:mb-2">
                    Purpose
                  </label>
                  <select
                    value={selectedPurpose}
                    onChange={(e) => setSelectedPurpose(e.target.value)}
                    className="w-full p-2 text-sm border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                  >
                    <option value="">All Purposes</option>
                    {purposeOptions.map((purpose) => (
                      <option key={purpose} value={purpose}>{purpose}</option>
                    ))}
                  </select>
                </div>

                {/* Sort Options */}
                <div className="sm:col-span-2 lg:col-span-1">
                  <label className="block text-xs md:text-sm font-medium mb-1 md:mb-2">
                    Sort By
                  </label>
                  <div className="flex gap-2">
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="flex-1 p-2 text-sm border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                    >
                      {sortOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setOrder(order === 'desc' ? 'asc' : 'desc')}
                      className="px-3"
                    >
                      {order === 'desc' ? '↓' : '↑'}
                    </Button>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-2">
                <Button onClick={handleSearch} className="flex-1 sm:flex-none text-sm">
                  Apply Filters
                </Button>
                {hasActiveFilters && (
                  <Button variant="outline" onClick={clearFilters} className="flex-1 sm:flex-none text-sm">
                    <X className="h-4 w-4 mr-1 md:mr-2" />
                    Clear All
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
