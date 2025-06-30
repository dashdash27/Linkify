// модальное окно
function openModal(class_name) {
    var modal = document.getElementsByClassName(class_name)[0];
    modal.style.display = "flex";
}

function closeModal(class_name) {
    var modal = document.getElementsByClassName(class_name)[0];
    modal.style.display = "none";
}
