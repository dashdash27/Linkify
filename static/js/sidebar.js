const togglers = document.querySelectorAll('.toggler')
const sidebar = document.querySelector('.sidebar')
const user_id = sidebar.querySelector('.user-data').getAttribute('data-user-id')
const userText = sidebar.querySelector('.user-text')
console.log(togglers, sidebar)

// проверка, открыто ли меню
let sidebarState = localStorage.getItem('sidebarState')
if (sidebarState === 'close') {
    sidebar.classList.add('sidebar-close')
}
else if (sidebarState === null) {
    localStorage.setItem('sidebarState', 'open');
}

togglers.forEach((toggler) => {
    toggler.addEventListener('click', () => {
        if (sidebarState === 'close') {
            sidebar.classList.remove('sidebar-close')
            localStorage.setItem('sidebarState', 'open');
            sidebarState = 'open'
        }
        else {
            sidebar.classList.add('sidebar-close')
            localStorage.setItem('sidebarState', 'close');
            sidebarState = 'close'
        }
    })
})

const mobileToggler = document.querySelector('.mobile-toggler')
mobileToggler.addEventListener('click', () => {
    sidebar.classList.toggle('sidebar-close')
})

if (window.matchMedia("only screen and (max-width: 480px)").matches) {
    sidebar.classList.add('sidebar-close')
}