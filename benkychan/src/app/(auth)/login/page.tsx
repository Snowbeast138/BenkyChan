"use client"; // Importante para interactividad
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const { email, password } = e.currentTarget;

    try {
      await signInWithEmailAndPassword(auth, email.value, password.value);
      router.push("/dashboard"); // Redirige al autenticar
    } catch (error) {
      if (error instanceof Error) {
        alert("Error al iniciar sesión: " + error.message);
      } else {
        alert("Error al iniciar sesión: " + String(error));
      }
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
      <button type="submit">Iniciar sesión</button>
    </form>
  );
}
