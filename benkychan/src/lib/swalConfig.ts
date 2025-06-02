import Swal from "sweetalert2";

export const showErrorAlert = (message: string) => {
  return Swal.fire({
    title: "Error",
    text: message,
    icon: "error",
    confirmButtonColor: "#6366f1",
  });
};

export const showSuccessAlert = (message: string) => {
  return Swal.fire({
    title: "¡Éxito!",
    text: message,
    icon: "success",
    confirmButtonColor: "#6366f1",
  });
};
