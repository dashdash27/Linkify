const noteMenu = document.querySelector('.note-menu')
const folderMenu = document.querySelector('.folder-menu')

function openConfirmDelete() {
    document.getElementsByClassName('confirm-delete')[0].style.display = 'flex'
}

// переменные для определения папки или заметки
let globalFolderId;
let globalNoteId;
let globalIsFolder = false;
let globalIsNote = false;

// --- Fetch-запросы ---
function deleteNote(note_id) {
    // Отправляем запрос в python
    return fetch('/delete_note', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            noteId: note_id
        })
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Failed to delete note');
        }
        return response.json();
    })
    .then(data => {
        console.log('Note deleted:', data.message);
        return true;
    })
    .catch(error => {
        console.error('Error deleting note', error);
        throw error;
    })
}

function deleteFolder(folder_id) {
    // Отправляем запрос в python
    return fetch('/delete_folder', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            folderId: folder_id
        })
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Failed to delete folder');
        }
        return response.json();
    })
    .then(data => {
        console.log('Folder deleted:', data.message);
        return true;
    })
    .catch(error => {
        console.error('Error deleting folder', error);
        throw error;
    })
}

// --- Получаем кнопки в форме подтверждения удаления ---
const confirmDelete = document.querySelector('.confirm-delete')
const confirmDeleteYes = confirmDelete.querySelector('.confirm-yes')
const confirmDeleteNo = confirmDelete.querySelector('.confirm-no')

confirmDeleteYes.addEventListener('click', () => {
    if (globalIsFolder == true) {
        deleteFolder(globalFolderId).then(() => {
            location.reload()
            confirmDelete.style.display = 'none'
        }).catch(error => {
            console.error('Error deleting folder', error)
        });
        globalIsFolder = false
    }
    if (globalIsNote == true) {
        deleteNote(globalNoteId).then(() => {
            location.reload()
            confirmDelete.style.display = 'none'
        }).catch(error => {
            console.error('Error deleting note', error)
        });
        globalIsNote = false
    }
})

confirmDeleteNo.addEventListener('click', () => {
    confirmDelete.style.display = 'none'
    globalIsNote = false
    globalIsFolder = false
})

// --- Контекстное меню при нажатии на папку ---
let folders = document.querySelectorAll('.folder');
folders.forEach((elem) => {
    elem.addEventListener("contextmenu", (e) => {
        e.preventDefault();

        if (noteMenu) {
            noteMenu.style.display = 'none';
          }
          if (folderMenu) {
            folderMenu.style.display = 'none';
          }

        folderMenu.style.display = 'flex';
        folderMenu.style.left = event.pageX+'px';
        folderMenu.style.top = event.pageY+'px';

        // получаем номер папки 
        const folder_id = elem.getAttribute('data-folder-id')
        const folder_name = elem.getAttribute('data-folder-name')

        // --- Обработчик на удаление папки ---
        const deleteButton = folderMenu.querySelector('.delete-item')
        deleteButton.addEventListener('click', (e) => {
            // чтобы контекстное меню не закрывалось
            e.stopPropagation()

            // открываем блок с подтверждением
            openConfirmDelete()

            // меняем значение глобальных переменных
            globalFolderId = folder_id
            globalIsFolder = true

            console.log("Папка", globalIsFolder, globalFolderId)
        })

        // --- Обработчик на переименование папки ---
        const renameButton = folderMenu.querySelector('.rename-item')
        renameButton.addEventListener('click', (e) => {
            e.stopPropagation()

            openModal('rename-folder')

            const renameModal = document.querySelector('.rename-folder')
            const inputRename = renameModal.querySelector('.input-name')
            const inputId = renameModal.querySelector('.input-id')
            inputId.value = folder_id
            inputRename.value = folder_name
        })
    })
})

// контекстное меню при нажатии на карточку заметки
let notes = document.querySelectorAll('.note-card');
notes.forEach((elem) => {
    elem.addEventListener("contextmenu", e => {
        e.preventDefault();
        if (noteMenu) {
            noteMenu.style.display = 'none';
          }
          if (folderMenu) {
            folderMenu.style.display = 'none';
          }
        noteMenu.style.display = 'flex';
        noteMenu.style.left = event.pageX+'px';
        noteMenu.style.top = event.pageY+'px';

        // получаем номер папки
        const note_id = elem.getAttribute('data-note-id')
        const note_name = elem.getAttribute('data-note-name').trim()

        // --- Обработчик на удаление ---
        const deleteButton = noteMenu.querySelector('.delete-item')
        deleteButton.addEventListener('click', (e) => {
            // чтобы контекстное меню не закрывалось
            e.stopPropagation()

            openConfirmDelete()

            // меняем значение глобальных переменных
            globalNoteId = note_id
            globalIsNote = true

            console.log("Папка", globalIsNote, globalNoteId)
        })

        // --- Обработчик на переименование заметки ---
        const renameButton = noteMenu.querySelector('.rename-item')
        renameButton.addEventListener('click', (e) => {
            e.stopPropagation()

            openModal('rename-note')

            const renameModal = document.querySelector('.rename-note')
            const inputRename = renameModal.querySelector('.input-name')
            const inputId = renameModal.querySelector('.input-id')
            inputId.value = note_id
            inputRename.value = note_name
        })
    })
})

// --- Для закрытия контекстного меню ---
window.addEventListener('click', () => {
  if (noteMenu) {
    noteMenu.style.display = 'none';
  }
  if (folderMenu) {
    folderMenu.style.display = 'none';
  }
});