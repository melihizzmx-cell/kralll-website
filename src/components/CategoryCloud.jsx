import CategoryItem from "./CategoryItem"
import { categories } from "../data/categories"

export default function CategoryCloud({ onSelectCategory, revealed }) {
  return (
    <div className="category-cloud" aria-label="Yaratıcı kategoriler">
      {categories.map((category, index) => (
        <CategoryItem
          key={category.id}
          category={category}
          index={index}
          onSelect={onSelectCategory}
          revealed={revealed}
        />
      ))}
    </div>
  )
}
