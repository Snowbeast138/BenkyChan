import Link from "next/link";
import { FiPlus } from "react-icons/fi";

export const AddTopicButton = () => {
  return (
    <Link href="/add-topic">
      <button className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
        <FiPlus />
        Añadir Tema
      </button>
    </Link>
  );
};
