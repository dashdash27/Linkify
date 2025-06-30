const color = document.querySelector('.user-data').getAttribute('data-color')
checkbox = document.querySelector('#theme-toggle-input')

function setLighttheme() {
    // Получаем корневой элемент
    const root = document.querySelector(":root");

    // меняем цвета
    root.style.setProperty("--background-color", "rgb(255, 255, 255)");
    root.style.setProperty("--main-contrast-color", "rgb(35, 36, 36)");
    root.style.setProperty("--sub-contrast-color", "rgb(219, 225, 229)");
    root.style.setProperty("--sub-color", "rgb(241, 246, 246)");
    root.style.setProperty("--selection-color", "rgba(233, 233, 233, 0.658)");
    root.style.setProperty("--accent-color", color);
}

function setDarktheme() {
    // Получаем корневой элемент
    const root = document.querySelector(":root");

    // меняем цвета
    root.style.setProperty("--background-color", "rgb(27, 33, 37)");
    root.style.setProperty("--main-contrast-color", "rgb(231, 231, 231)");
    root.style.setProperty("--sub-contrast-color", "rgb(128, 137, 141)");
    root.style.setProperty("--sub-color", "rgb(41, 48, 53)");
    root.style.setProperty("--selection-color", "rgba(64, 71, 78, 0.66)");
    root.style.setProperty("--accent-color", color);
}

const themeToggle = document.querySelector('.theme-toggle')
const themeImg = themeToggle.querySelector('img')
const storedTheme = localStorage.getItem('theme')

// устанавливаем по умолчанию
if (storedTheme == null) {
    localStorage.setItem('theme', 'light')
    setLighttheme()
    checkbox.checked = false;
}

if (storedTheme == 'light') {
    setLighttheme()
    checkbox.checked = false;
}

if (storedTheme == 'dark') {
    setDarktheme()
    checkbox.checked = true;
}

document.body.style.display = 'flex'

document.addEventListener('DOMContentLoaded', function() {

    // устанавливаем то, что было

    themeToggle.addEventListener('click', function() {
        let storedTheme = localStorage.getItem('theme')

        if (storedTheme === 'dark') {
            // переключаем на светлую
            localStorage.setItem('theme', 'light')
            setLighttheme()
        }
        if (storedTheme === 'light') {
            // переключаем на темную
            localStorage.setItem('theme', 'dark')
            setDarktheme()
        }
    })
});