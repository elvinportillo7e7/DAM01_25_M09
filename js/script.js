document.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll("a").forEach(enlace => {
        enlace.addEventListener("click", e => {
            if (enlace.href.includes("#")) return;

            e.preventDefault();
            document.body.style.opacity = "0";
            setTimeout(() => {
                window.location.href = enlace.href;
            }, 200);
        });
    });
});
