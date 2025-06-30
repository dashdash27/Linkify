from app import db
from models.database import Note
import re

# функция удаления ссылок в связанных заметках
def remove_backlink_references(note_id, note_title):
    note = Note.query.get(note_id)
    backlinks = note.backlinks

    for link in backlinks:
        backlink_note = link.from_note

        link_string_pattern = r'<object><a\s+href="../note/{}"\s+id="{}"\s+class="link-item">[^<]+</a></object>'.format(note_id, note_id)
        new_content = re.sub(link_string_pattern, '', backlink_note.content, flags=re.DOTALL)

        backlink_note.content = new_content
        db.session.commit()


# функция переименования ссылок
def rename_backlinks(note_id, new_title):
    note = Note.query.get(note_id)
    backlinks = note.backlinks

    print("Переименовываются backlinks заметки ", note.title)

    for link in backlinks:
        backlink_note = link.from_note

        link_string = '<object><a href="../note/{}" id="{}" class="link-item">{}</a></object>'.format(note_id.strip(), note_id.strip(), note.title.strip())
        replace_string = '<object><a href="../note/{}" id="{}" class="link-item">{}</a></object>'.format(note_id.strip(), note_id.strip(), new_title.strip())
        
        new_content = backlink_note.content.replace(link_string, replace_string)

        backlink_note.content = new_content
        db.session.commit()

        print("Переименовались backlinks в: ", backlink_note.title)