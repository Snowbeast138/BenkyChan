// utils/fetchPregunta.ts
export async function fetchPregunta(categoria: string = "historia") {
  const res = await fetch(
    `/api/generar-pregunta?categoria=${encodeURIComponent(categoria)}`
  );
  if (!res.ok) throw new Error("Error al generar pregunta");
  return res.json();
}
