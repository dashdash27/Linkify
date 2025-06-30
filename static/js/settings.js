const settingsModal = document.querySelector('.settings-modal-wrapper')

// --- Save button ---
const saveButton = settingsModal.querySelector('.save')

const username = settingsModal.querySelector('.username').querySelector('.input')
const email = settingsModal.querySelector('.email').querySelector('.input')
const inputPicker = settingsModal.querySelector('.input-picker')
const currentUsername = username.value
const currentEmail = email.value
const currentColor = inputPicker.value


// --- Подсвечиваем кнопку при изменении
username.addEventListener("input", function() {
    saveButton.classList.add('active-button')
})

email.addEventListener("input", function() {
    saveButton.classList.add('active-button')
})

inputPicker.addEventListener("input", function() {
    saveButton.classList.add('active-button')
})


// --- Обновление имени ---
function updateUserData(new_username, new_user_email, new_user_color, new_user_avatar) {
    return fetch('/update_user_data', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            userId: user_id,
            newUsername: new_username,
            newUserEmail: new_user_email,
            newUserColor: new_user_color,
            newUserAvatar: new_user_avatar
        })
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Failed to gupdate data');
        }
        return response.json();
    })
    .then(data => {
        console.log(data)
        return true;
    })
    .catch(error => {
        console.error('Error updating data', error);
        throw error;
    })
}


// --- Avatars ---
const currentAvatar = document.querySelector('.user-ava')
const currentAvatarSrc = currentAvatar.src
const currentAvatarId = currentAvatar.getAttribute('data-id')
const avatarItemsBlock = document.querySelector('.avatar-items')
const avatarItems = avatarItemsBlock.querySelectorAll('.item')

// устанавливаем атрибуты
let avaId = 0
avatarItems.forEach((elem) => {
    elem.setAttribute('data-id', avaId)
    if (avaId == currentAvatarId) {
        elem.classList.add('active-avatar')
    }
    avaId += 1
})

// обрабатываем клик 
avatarItems.forEach((elem) => {
    elem.addEventListener('click', () => {
        currentAvatar.src = elem.src
        currentAvatar.setAttribute('data-id', elem.getAttribute('data-id'))
        saveButton.classList.add('active-button')
        
        avatarItems.forEach((item) => {
            item.classList.remove('active-avatar')
        })

        elem.classList.add('active-avatar')
    })
})

// --- Обработчик клика на кнопку save---
saveButton.addEventListener('click', () => {
    let new_username = username.value
    let new_user_email = email.value
    let new_user_color = inputPicker.value
    let new_user_avatar = currentAvatar.getAttribute('data-id')

    console.log(email.validity.valueMissing)

    if (email.value === '' || !(email.value.includes("@"))) {
        document.querySelector('.errors').innerHTML = "Некорректный формат email"
    }
    else if (username.value === '') {
        document.querySelector('.errors').innerHTML = "Введите username"
    }
    else {
        Promise.all([updateUserData(new_username, new_user_email, new_user_color, new_user_avatar)])
        .then(() => {
            console.log('Данные обновились!')
            location.reload()
        })
        .catch(error => {
            console.error('Error:', error);
        })
    }
})


// --- Закрытие и открытие окна ---
const closeButton = settingsModal.querySelector('.cancel')
closeButton.addEventListener('click', ( )=> {
    settingsModal.style.display = 'none'
    username.value = currentUsername
    email.value = currentEmail
    saveButton.classList.remove('active-button')
    currentAvatar.src = currentAvatarSrc
    inputPicker.value = currentColor
    currentAvatar.setAttribute('data-id', currentAvatarId)

    avatarItems.forEach((item) => {
        item.classList.remove('active-avatar')

        if (item.getAttribute('data-id') == currentAvatarId) {
            item.classList.add('active-avatar')
        }
    })
})

// открытие кнопки
const settingsLink = document.querySelector('.settings-link')
settingsLink.addEventListener('click', ( )=> {
    settingsModal.style.display = 'flex'
})
