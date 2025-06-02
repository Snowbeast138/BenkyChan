import { useEffect } from "react";
import { auth } from "../../lib/firebase";
import { useRouter } from "next/router";
import { User } from "firebase/auth";

export const useAuthRedirect = (requiredAuth: boolean = true) => {
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user: User | null) => {
      if (requiredAuth && !user) {
        router.push("/login");
      } else if (!requiredAuth && user) {
        router.push("/");
      }
    });
    return () => unsubscribe();
  }, [router, requiredAuth]);
};
