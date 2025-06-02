import { useRouter } from "next/router";
import { auth } from "@/lib/firebase";
import { FiLogOut } from "react-icons/fi";

export const LogoutButton = () => {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await auth.signOut();
      router.push("/login");
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  return (
    <button
      onClick={handleLogout}
      className="flex items-center gap-2 bg-white text-red-500 px-4 py-2 rounded-lg hover:bg-red-50 border border-red-100 transition-colors"
    >
      <FiLogOut />
      Cerrar Sesión
    </button>
  );
};
