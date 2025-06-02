import Link from "next/link";

interface Category {
  id: number;
  name: string;
}

export default function CategoryCard({ category }: { category: Category }) {
  return (
    <div className="border p-4">
      <h2 className="text-xl">{category.name}</h2>
      <Link
        href={`/admin/categories/${category.id}/edit`}
        className="text-green-500"
      >
        Edit
      </Link>
    </div>
  );
}
