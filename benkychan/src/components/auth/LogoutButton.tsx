import { useRouter } from "next/router";
import { auth } from "@/lib/firebase";
import { FiLogOut } from "react-icons/fi";
import { useState } from "react"; // Added for loading state

/**
 * LogoutButton Component
 * 
 * A reusable button that handles user logout functionality with:
 * - Firebase authentication sign-out
 * - Automatic redirect to login page
 * - Error handling and logging
 * - Visual feedback during operation
 * - Accessibility best practices
 * 
 * @example
 * <LogoutButton />
 * 
 * @example With custom class
 * <LogoutButton className="ml-4" />
 */
export const LogoutButton = ({ className = "" }: { className?: string }) => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false); // Track loading state

  /**
   * Handles the user logout process
   * 
   * 1. Sets loading state
   * 2. Attempts Firebase sign-out
   * 3. Redirects to login page on success
   * 4. Handles and logs errors
   * 5. Resets loading state
   */
  const handleLogout = async () => {
    setIsLoading(true);
    try {
      await auth.signOut();
      router.push("/login");
    } catch (err) {
      console.error("Logout error:", err);
      // Consider adding toast notification here
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleLogout}
      disabled={isLoading}
      aria-label="Cerrar sesión"
      className={`flex items-center gap-2 bg-white text-red-500 px-4 py-2 rounded-lg hover:bg-red-50 border border-red-100 transition-colors disabled:opacity-70 disabled:cursor-not-allowed ${className}`}
    >
      {isLoading ? (
        <span className="animate-spin">↻</span> // Simple spinner
      ) : (
        <FiLogOut />
      )}
      <span>{isLoading ? "Cerrando..." : "Cerrar Sesión"}</span>
    </button>
  );
};

/**
 * PROPS
 * -----
 * className?: string - Optional additional CSS classes
 * 
 * IMPROVEMENTS MADE:
 * 1. Added loading state with visual feedback
 * 2. Disabled button during operation
 * 3. Added accessibility label
 * 4. Made button style customizable via className prop
 * 5. Added text change during loading
 * 6. Added basic spinner animation
 * 7. Improved TypeScript typing
 * 
 * FUTURE ENHANCEMENTS:
 * 1. Add confirmation dialog
 * 2. Implement toast notifications
 * 3. Add success/error callbacks
 * 4. Support for different button variants
 * 5. Customizable icon via prop
 */