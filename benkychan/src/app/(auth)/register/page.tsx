"use client";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const { email, password } = e.currentTarget;

    try {
      await createUserWithEmailAndPassword(auth, email.value, password.value);
      router.push("/dashboard");
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      alert("Error al registrarse: " + errorMessage);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input type="email" name="email" placeholder="Correo" required />
      <input
        type="password"
        name="password"
        placeholder="Contraseña"
        required
      />
      <button type="submit">Registrarse</button>
    </form>
  );
}
