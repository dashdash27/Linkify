

function openModal() {
    var modal = document.getElementById("modal-wrapper");
    modal.style.display = "flex";
    body.style.opacity = 0.2;
}

function closeModal() {
    var modal = document.getElementById("modal-wrapper");
    modal.style.display = "none";
    body.style.opacity = 1;
}