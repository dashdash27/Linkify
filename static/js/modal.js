
function openModal(class_name) {
    var modal = document.getElementsByClassName(class_name)[0];
    modal.style.display = "flex";
}

function closeModal(class_name) {
    var modal = document.getElementsByClassName(class_name)[0];
    modal.style.display = "none";
}

let folders = document.querySelectorAll('.folder');
console.log(folders);
folders.forEach((elem) => {
    elem.addEventListener("contextmenu", e => {
        e.preventDefault();
        const menu = document.getElementById('folder-menu').style;
        menu.display = 'block';
        menu.left = event.pageX+'px';
        menu.top = event.pageY+'px';
    })
})

window.addEventListener('click', () => {
  document.getElementById('folder-menu').style.display = 'none';
});