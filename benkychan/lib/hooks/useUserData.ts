import { useEffect, useState } from "react";
import { auth } from "../../lib/firebase";
import { getUserStats, getUserTopics } from "../../lib/api";
import { Topic, UserStats } from "../../types";
import { User } from "firebase/auth";
import { useRouter } from "next/router";

export const useUserData = () => {
  const router = useRouter();
  const [topics, setTopics] = useState<Topic[]>([]);
  const [userStats, setUserStats] = useState<UserStats>({
    progress: 0,
    quizzesTaken: [],
    correctAnswers: [],
    totalAnswers: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user: User | null) => {
      if (!user) {
        router.push("/login");
      } else {
        try {
          const [userTopics, stats] = await Promise.all([
            getUserTopics(user.uid),
            getUserStats(user.uid),
          ]);
          setTopics(userTopics);
          setUserStats(stats);
        } catch (error) {
          console.error("Error loading data:", error);
        } finally {
          setLoading(false);
        }
      }
    });
    return () => unsubscribe();
  }, [router]);

  return { topics, userStats, loading };
};
