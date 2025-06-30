// --- Получаем элементы модального окна для ссылок ---
var createLinkModal = document.querySelector('.create-link')
var createLinkDesc = createLinkModal.querySelector('.desc')

const buttonShowConnects = document.querySelector('.show-connects')
const connectsBlock = document.querySelector('.connects-block')
buttonShowConnects.addEventListener('click', () => {
    connectsBlock.classList.toggle('connects-block-active')
})

// слушаем изменения в поле Input
const searchLink = document.querySelector('.search-link')
searchLink.addEventListener('input', (e) => {
    const query = e.target.value.trim();
    updateNotesList(query);
});

// createLinkFlag - создаем новую или добавляем связи?
var createLinkFlag = false

// текущий linksBlock
let currentLinksBlock = null;

// --- Получаем список заметок пользователя ---
let titles = document.querySelectorAll('.note-item-title')
let ids = document.querySelectorAll('.note-item-id');
let userNotes = [];
titles.forEach((title, index) => {
    let id = ids[index].textContent.trim(); // Удаляем пробелы с краев ID
    let text = title.textContent.trim(); // Удаляем пробелы с краев текста
    let isChosen = false
    userNotes.push({ id, title: text , isChosen});
});
// удаляем текущую заметку оттуда
userNotes = userNotes.filter(note => note.id !== note_id);

// получаем элементы в модальном окне (выбор заметок)
let noteItems = document.querySelectorAll('.note-item')

// --- Кнопки создания ссылок в каждом абзаце ---
let linkButtons = document.querySelectorAll('.side-block')
linkButtons.forEach((elem) => {
    elem.addEventListener("click", () => linkButtonsClick(elem))
})

// --- Connects Block Updator ---
function updateConnectsBlock() {
    fetch('/get_note_connects', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            noteId: note_id
        })
    })
    .then(response => response.json())
    .then(data => {
        console.log('Backlinks:', data.backlinks);
        console.log('Outlinks:', data.outlinks);

        // теперь обновляем окошко с ссылками
        let outlinksItems = connectsBlock.querySelector('.outlinks-items')
        outlinksItems.innerHTML = ""

        data.outlinks.forEach((outlink) => {
            let outlinkItem = document.createElement('a')
            outlinkItem.href = "../note/" + outlink.id.toString()
            outlinkItem.textContent = outlink.title.toString()
            outlinkItem.setAttribute('id', outlink.id.toString());
            outlinkItem.className = 'outlink'
            outlinksItems.appendChild(outlinkItem)
        })

    })
    .catch(error => console.error('Error:', error));
}


// --- Fetch-запрос ---
function createNote(new_note_title, current_note_id) {
    return fetch('/create_note', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            noteTitle: new_note_title,
            currentNoteId: current_note_id
        })
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Failed to create note');
        }
        return response.json();
    })
    .then(data => {
        console.log('Note created:', data.message);
        return data.noteId; // Возвращаем ID созданной заметки
    })
    .catch(error => {
        console.error('Error creating note', error);
        throw error;
    })
}

// --- Получение списка id ссылок ---
function getLinksIds() {
    let ids = []
    const linksBlocks = document.querySelectorAll('.links-block')
    // проходим по каждому блоку
    linksBlocks.forEach((linksBlock) => {
        links = linksBlock.querySelectorAll('.link-item')
        links.forEach((link) => {
            const linkId = link.getAttribute('id')
            ids.push(linkId.toString())
        })
    })
    let setIds = new Set(ids)
    console.log(setIds)

    return setIds
}

// --- Изменение ссылок ---
function updateConnects() {
    // получаем список ссылок
    let setIds = getLinksIds()

    // Отправляем запрос в python
    return fetch('/update_connects', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            noteId: note_id,
            outlinksIds: Array.from(setIds)
        })
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Failed to change connects');
        }
        return response.json();
    })
    .then(data => {
        console.log('Connects changed:', data.message);
        updateConnectsBlock()
        return true;
    })
    .catch(error => {
        console.error('Error changng connects', error);
        throw error;
    })
    
};

function linkButtonsClick(elem) {
    // ищем ближайщий блок для ссылок относительно этой кнопки
    const rowBlock = elem.closest('.row-block');
    currentLinksBlock = rowBlock.querySelector('.links-block');
    
    // отмечаем уже стоящие
    userNotes.forEach((elem) => {
        elem.isChosen = false
    })
    if (currentLinksBlock.childElementCount > 0) {
        const presentLinks = currentLinksBlock.querySelectorAll('.link-item')
        console.log("PRESENT",presentLinks)

        presentLinks.forEach((presentLink) => {
            console.log("USER NOTES", userNotes)
            console.log(userNotes.find(note => note.id === presentLink.getAttribute('id')))
            userNotes.find(note => note.id === presentLink.getAttribute('id')).isChosen = true
        })
    }

    updateNotesList('');
    openModal('create-link')
}

const addLinkBtn = document.querySelector('.add-link-btn')
addLinkBtn.addEventListener('click', () => {
    if (createLinkFlag === false) {
        if (!currentLinksBlock) return;

        currentLinksBlock.innerHTML = ''

        // для каждой выбранной заметки создаем ссылку
        const chosenNotes = userNotes.filter(note => note.isChosen === true)
        chosenNotes.forEach((chosenNote) => {
            let link = document.createElement('a')
            let obj = document.createElement('object')
            link.href = "../note/" + chosenNote.id.toString()
            link.textContent = chosenNote.title.toString()
            link.setAttribute('id', chosenNote.id.toString());
            link.className = 'link-item'
            obj.appendChild(link)
            currentLinksBlock.appendChild(obj)
        })
    }
    else {
        // тогда создаем заметку сначала, а потом уже ссылку
        const new_note_title = searchLink.value.trim()

        createNote(new_note_title, note_id)
        .then(noteId => {
            console.log('ID созданной заметки:', noteId);

            let link = document.createElement('a')
            let obj = document.createElement('object')
            link.href = "../note/" + noteId.toString()
            link.textContent = new_note_title.toString()
            link.setAttribute('id', noteId.toString());
            link.className = 'link-item'
            obj.appendChild(link)
            currentLinksBlock.appendChild(obj)
        })
        .catch(error => {
            console.error('Ошибка при создании заметки:', error);
        });
    }
    closeModal('create-link')
    setTimeout(() => {
        saveNote()
        updateConnects()
    }, 1000);
    
})


function updateNotesList(query) {
    const matchNotes = document.getElementById('match-notes')
    matchNotes.innerHTML = ''

    // фильтруем заметки по названию
    const filteredNotes = userNotes.filter(note => 
        note.title.toLowerCase().startsWith(query.toLowerCase())
    )
    // Создаём элементы списка для отфильтрованных заметок
    filteredNotes.forEach(filteredNote => {
        const noteItem = document.createElement('div')
        const noteTitle = document.createElement('div')
        const noteId = document.createElement('div')
        const noteCheckMark = document.createElement('div')

        noteItem.className = "note-item"
        noteTitle.className = "note-item-title"
        noteId.className = "note-item-id"
        noteCheckMark.className = "check-mark"
        
        noteTitle.textContent = filteredNote.title
        noteId.textContent = filteredNote.id
        noteCheckMark.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24"><path fill="none" stroke="#1c1c1c" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m4 12l6 6L20 6"/></svg>'

        matchNotes.appendChild(noteItem)
        noteItem.appendChild(noteTitle)
        noteItem.appendChild(noteId)
        noteItem.appendChild(noteCheckMark)
        if (userNotes.find(note => note.id === filteredNote.id).isChosen == true) {
            noteItem.classList.add("note-item-chosen");
        }
    });

    noteItems = document.querySelectorAll('.note-item')
    console.log(noteItems) 
    noteItems.forEach((elem) => {
        elem.addEventListener("click", e => {
            elem.classList.toggle("note-item-chosen")
            const noteId = elem.querySelector('.note-item-id').textContent.trim();
            userNote = userNotes.find(note => note.id === noteId)
            userNote.isChosen = !userNote.isChosen
        })
    })

    if (filteredNotes.length === 0) {
        createLinkDesc.innerHTML = "Совпадающих заметок нет, но вы можете создать новую и добавить ссылку на нее"
        addLinkBtn.innerHTML = "Create and Connect"
        createLinkFlag = true
    }
    else {
        createLinkDesc.innerHTML = "Доступные заметки"
        addLinkBtn.innerHTML = "Добавить"
        createLinkFlag = false
    }
}

// выборка заметок-ссылок
noteItems.forEach((elem) => {
    elem.addEventListener("click", e => {
        elem.classList.toggle("note-item-chosen")
        const noteId = elem.querySelector('.note-item-id').textContent.trim();
        userNote = userNotes.find(note => note.id === noteId)
        userNote.isChosen = !userNote.isChosen
    })
})
