const toast =
    document.getElementById("toast");

let toastTimeout;

function mostrarToast(
    mensaje,
    tipo = "success"
) {

    clearTimeout(toastTimeout);

    toast.textContent =
        mensaje;

    toast.className =
        "";

    toast.classList.add(
        "activo",
        tipo
    );

    toastTimeout = setTimeout(() => {

        toast.classList.remove(
            "activo",
            "success",
            "error",
            "warning"
        );

    }, 3000);

}