const content = document.getElementById('note-content');
const title = document.getElementById('note-title')
const note_id = content.getAttribute('data-note-id');
let timeout;

content.addEventListener('input', function() {
    // очищаем timeout
    clearTimeout(timeout);
    // сохраняем через 3 секунды
    timeout = setTimeout(saveNote, 1000)
})

title.addEventListener('input', function() {
    // очищаем timeout
    clearTimeout(timeout);
    // сохраняем через 3 секунды
    timeout = setTimeout(saveNote, 1000)
})

function saveNote() {
    const note_content = content.innerHTML.replace(/<br\s*\/?>/g, '');
    const note_title = title.innerHTML;

    fetch('/autosave', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            noteContent: note_content,
            noteTitle: note_title,
            noteId: note_id
        })
    })
    .then(response => response.json())
    .then(data => {
       // Обработка ответа от сервера (например, вывод сообщения об успехе или ошибке)
       console.log('Note saved:', data.message);
    })
    .catch(error => {
        console.error('Error saving note:', error);
    });
}
