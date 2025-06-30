from app import app
from flask import request, jsonify
from flask_login import login_required
from models.database import Note
from routes.helpfunc import *


@app.route('/autosave', methods=['POST'])
@login_required
def autosave():
    print("BAAADDd")
    try:
        data = request.get_json()
        note_content = data['noteContent']
        note_title = data['noteTitle']
        note_id = data['noteId']

        note = Note.query.get(note_id)

        # проверка, изменился ли заголовок
        if note.title != note_title:
            rename_backlinks(note_id, note_title)

        note.set_content(note_content)
        note.set_title(note_title)

        print("Защли в save", note_content)

        return jsonify({'message': f'Note {note_id} saved successfully!'})
    except Exception as e:
        print("Защли вfff", str(e))
        return jsonify({'message': f'Error saving note: {str(e)}, {str(note.title)}'}), 500