import { FiAward } from "react-icons/fi";
import { LogoutButton } from "../auth/LogoutButton";

export const Header = () => {
  return (
    <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
      <div className="flex items-center gap-3">
        <div className="bg-blue-600 text-white p-2 rounded-lg">
          <FiAward className="text-2xl" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-blue-800">BenkyChan</h1>
          <p className="text-gray-600">Aprende mediante trivias interactivas</p>
        </div>
      </div>
      <LogoutButton />
    </header>
  );
};
