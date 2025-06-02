import DebouncedInput from "@/components/DebouncedInput";

interface Category {
  id: string;
  name: string;
}

interface ArticleFiltersProps {
  categories: Category[];
  selectedCategory: string;
  search: string;
  onCategoryChange: (categoryId: string) => void;
  onSearchChange: (searchValue: string) => void;
  onClearFilters: () => void;
}

export default function ArticleFilters({
  categories,
  selectedCategory,
  search,
  onCategoryChange,
  onSearchChange,
  onClearFilters,
}: ArticleFiltersProps) {
  return (
    <div className="bg-gradient-to-br from-blue-600 via-blue-500 to-blue-700 relative -mt-8 pb-8">
      <div className="relative z-10 px-6">
        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 max-w-2xl mx-auto">
          <div className="flex-1">
            <select
              value={selectedCategory}
              onChange={(e) => onCategoryChange(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border-0 bg-white/90 backdrop-blur-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-white/50 transition"
            >
              <option value="">All categories</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
          <div className="flex-2">
            <DebouncedInput
              value={search}
              onChange={onSearchChange}
              placeholder="Search articles by title or name..."
              debounceMs={300}
              className="w-full px-4 py-3 rounded-lg border-0 bg-white/90 backdrop-blur-sm text-gray-700 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white/50 transition"
            />
          </div>
        </div>

        {/* Active filters indicator */}
        {(search || selectedCategory) && (
          <div className="mt-4 flex justify-center">
            <div className="bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 flex items-center gap-2">
              {selectedCategory && (
                <span className="text-white text-sm">
                  Category:{" "}
                  {categories.find((cat) => cat.id === selectedCategory)?.name}
                </span>
              )}
              {search && (
                <span className="text-white text-sm">Search: "{search}"</span>
              )}
              <button
                onClick={onClearFilters}
                className="text-white hover:text-blue-200 text-sm ml-2 underline"
              >
                Clear
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
