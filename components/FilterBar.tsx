'use client'

import { Collection, Tag } from '@/types'

interface FilterBarProps {
  collections: Collection[]
  tags: Tag[]
  selectedCollection: string
  selectedTags: string[]
  searchQuery: string
  onCollectionChange: (collectionId: string) => void
  onTagsChange: (tagIds: string[]) => void
  onSearchChange: (query: string) => void
}

export default function FilterBar({
  collections,
  tags,
  selectedCollection,
  selectedTags,
  searchQuery,
  onCollectionChange,
  onTagsChange,
  onSearchChange
}: FilterBarProps) {
  const handleTagToggle = (tagId: string) => {
    if (selectedTags.includes(tagId)) {
      onTagsChange(selectedTags.filter(id => id !== tagId))
    } else {
      onTagsChange([...selectedTags, tagId])
    }
  }

  const clearAllFilters = () => {
    onCollectionChange('')
    onTagsChange([])
    onSearchChange('')
  }

  const hasActiveFilters = selectedCollection || selectedTags.length > 0 || searchQuery

  const getTagColorClass = (color?: { key: string; value: string }) => {
    if (!color) return 'color-blue hover:color-blue'
    return `color-${color.key} hover:color-${color.key}`
  }

  return (
    <div className="card space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-gray-900">Filter & Search</h3>
        {hasActiveFilters && (
          <button
            onClick={clearAllFilters}
            className="text-sm text-primary-600 hover:text-primary-700 font-medium"
          >
            Clear All
          </button>
        )}
      </div>

      {/* Search Bar */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <input
          type="text"
          placeholder="Search notes by title, content, or summary..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="input pl-10"
        />
      </div>

      {/* Collection Filter */}
      {collections.length > 0 && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Collection
          </label>
          <select
            value={selectedCollection}
            onChange={(e) => onCollectionChange(e.target.value)}
            className="input"
          >
            <option value="">All Collections</option>
            {collections.map((collection) => (
              <option key={collection.id} value={collection.id}>
                {collection.metadata?.name || collection.title}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Tags Filter */}
      {tags.length > 0 && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tags
          </label>
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => {
              const isSelected = selectedTags.includes(tag.id)
              return (
                <button
                  key={tag.id}
                  onClick={() => handleTagToggle(tag.id)}
                  className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border transition-colors ${
                    isSelected
                      ? `${getTagColorClass(tag.metadata?.color)} ring-2 ring-primary-200`
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  🏷️ {tag.metadata?.name || tag.title}
                  {isSelected && (
                    <svg className="ml-1 h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* Active Filters Summary */}
      {hasActiveFilters && (
        <div className="pt-2 border-t border-gray-200">
          <div className="text-sm text-gray-600">
            {searchQuery && (
              <span>Searching for "{searchQuery}"</span>
            )}
            {selectedCollection && (
              <span>
                {searchQuery ? ' • ' : ''}
                Collection: {collections.find(c => c.id === selectedCollection)?.metadata?.name}
              </span>
            )}
            {selectedTags.length > 0 && (
              <span>
                {(searchQuery || selectedCollection) ? ' • ' : ''}
                {selectedTags.length} tag{selectedTags.length > 1 ? 's' : ''} selected
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  )
}