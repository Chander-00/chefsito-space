import Link from "next/link";

interface RecipeCreatorProps {
  creatorName: string;
  userId: string;
}

export const RecipeCreator: React.FC<RecipeCreatorProps> = ({
  creatorName,
  userId,
}) => (
  <div>
    <h3 className="text-lg font-semibold mb-2 text-trinidad-100">Created by</h3>
    <Link href={`/users/${userId}`} className="flex items-center hover:opacity-80 transition-opacity">
      <div className="w-10 h-10 rounded-full bg-trinidad-600 flex items-center justify-center text-trinidad-100 font-semibold">
        {creatorName
          .split(" ")
          .map((n) => n[0])
          .join("")}
      </div>
      <span className="ml-2 text-trinidad-100 underline-offset-2 hover:underline">{creatorName}</span>
    </Link>
  </div>
);
