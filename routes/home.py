from app import app, db
from flask import render_template, request, redirect, url_for, jsonify
from flask_login import login_required, current_user

from models.database import Folder, Note
from datetime import date

from routes.helpfunc import *


# --- Folders ---
@app.route('/folders', methods=['GET', 'POST'])
@login_required
def folders():
    user = current_user

    # обработка модальных окошек
    if request.method == "POST":

        if request.form["form_name"] == "create_folder":
            name = request.form['name']
            # берем корневую папку (она создавалась первая при регистрации)
            parent = user.folders[0]
            Folder.create(name, parent, user)
            return redirect(request.url)
        
        elif request.form["form_name"] == "create_note":
            # создаем заметку, прикрепленную к папке
            name = request.form['name']
            Note.create(name, user.folders[0], user, date.today())
            return redirect(request.url)

        elif request.form["form_name"] == "rename_folder":
            new_name = request.form['name']
            folder_id = request.form['folder_id']
            folder = Folder.query.get(folder_id)
            folder.name = new_name
            db.session.commit()
            return redirect(request.url)
        
        elif request.form["form_name"] == "rename_note":
            new_name = request.form['name']
            note_id = request.form['note_id']
            note = Note.query.get(note_id)
            
            # переименовываем backlinks (один из алгоритмов)
            rename_backlinks(note_id, new_name)

            note.title = new_name
            db.session.commit()

            return redirect(request.url)

    else:
        # показ всех главных папок пользователя (не subfolders)
        user_folders = user.folders[0].subfolders
        return render_template('access/folders.html', folders=sorted(user_folders, key=lambda folder: folder.id), root_folder=user.folders[0])


# --- Текущая заметка пользователя ---
@app.route('/note/<int:id>', methods=['GET', 'POST'])
@login_required
def note(id):
    note = Note.query.get(id)
    user = note.user
    user_notes = user.notes

    # получаем backlinks и outlinks
    backlinks = note.get_backlinks()
    outlinks = note.get_outlinks()

    # считаем путь к заметке (для навигации интерактивной)
    path = ""
    help_folder = note.folder
    parent = help_folder.parent
    if parent:
        while parent.name != "root_folder":
            path = "<a href='/folders/" + str(parent.id) + "'>" + parent.name + "</a>" + "<span>/</span>" + path
            help_folder = help_folder.parent
            parent = help_folder.parent
        path = "<a href='/folders'>Рабочий стол</a>" + "<span>/</span>" + path
        path += "<a href='/folders/" + str(note.folder.id) + "'>" + note.folder.name + "</a>" + "<span>/</span>"
        path += note.title
    else:
        path = "<a href='/folders'>Рабочий стол</a>" + "<span>/</span>"
        path += note.title

    return render_template('access/note.html', note=note, path=path, user_notes=user_notes, backlinks=backlinks, outlinks=outlinks)


@app.route('/folders/<int:id>', methods=['GET', 'POST'])
@login_required
def folder_details(id):
    folder = Folder.query.get(id)
    user = current_user
    if request.method == "POST":
        # если была отправлена папка
        if request.form["form_name"] == "create_folder":
            name = request.form['name']
            Folder.create(name, folder, user)
            return redirect(request.url)
        elif request.form["form_name"] == "create_note":
            # создаем заметку, прикрепленную к папке
            name = request.form['name']
            Note.create(name, folder, user,  date.today())
            note_id = int(user.notes[len(user.notes) - 1].id)
            return redirect(url_for('note', id=note_id))
        elif request.form["form_name"] == "rename_folder":
            new_name = request.form['name']
            folder_id = request.form['folder_id']
            folder = Folder.query.get(folder_id)
            folder.name = new_name
            db.session.commit()
            return redirect(request.url)
        
        elif request.form["form_name"] == "rename_note":
            new_name = request.form['name']
            note_id = request.form['note_id']
            note = Note.query.get(note_id)
            note.title = new_name
            db.session.commit()
            return redirect(request.url)
    else:
        # считаем путь к папке
        path = ""
        help_folder = folder
        parent = help_folder.parent
        while parent.name!="root_folder":
            path = "<a href='/folders/" + str(parent.id) + "'>" + parent.name + "</a>" + "<span>/</span>" + path
            help_folder = help_folder.parent
            parent = help_folder.parent
        path = "<a href='/folders'>Рабочий стол</a>" + "<span>/</span>" + path
        path += folder.name

        return render_template('access/folder_details.html', folder=folder, subfolders=sorted(folder.subfolders, key=lambda sf: sf.id), path=path)


# --- Fetch для удаления заметки ---
@app.route('/delete_note', methods=['POST'])
@login_required
def delete_note():
    try:
        data = request.get_json()
        note_id = data['noteId']
        note = Note.query.get(note_id)

        # сначала подредактируем контент в других заметках
        remove_backlink_references(note.id, note.title)

        # удаляем все outlinks и backlinks
        for connect in note.outlinks:
            db.session.delete(connect)
        for connect in note.backlinks:
            db.session.delete(connect)

        # удаляем заметку
        db.session.delete(note)
        db.session.commit()

        return jsonify({'message': f'Note {note_id} deleted successfully!'})
    
    except Exception as e:
        return jsonify({'message': f'Error deleting note: {str(e)}, {str(note.title)}'}), 500
    
    
# --- Fetch для удаления папки ---
@app.route('/delete_folder', methods=['POST'])
@login_required
def delete_folder():
    try:
        data = request.get_json()
        folder_id = data['folderId']
        
        folder = Folder.query.get(folder_id)

        # перед удалением надо в других заметках поудалять backlinks
        for note in folder.notes:
            remove_backlink_references(note.id, note.title)
            # удаляем все штуки
            for connect in note.outlinks:
                db.session.delete(connect)
            for connect in note.backlinks:
                db.session.delete(connect)

        db.session.delete(folder)
        db.session.commit()

        return jsonify({'message': f'Folder {folder_id} deleted successfully!'})
    
    except Exception as e:
        return jsonify({'message': f'Error deleting folder: {str(e)}, {str(folder.id)}'}), 500
    

# --- Fetch для обновления связей у заметки ---
@app.route('/update_connects', methods=['POST'])
@login_required
def update_connects():
    try:
        data = request.get_json()
        note_id = data['noteId']
        outlinks_ids = data['outlinksIds']
        note = Note.query.get(note_id)

        # удаляем старые связи
        for outlink in note.outlinks:
            db.session.delete(outlink)
        db.session.commit()

        # обновляем связи
        note.update_outlinks(outlinks_ids)

        return jsonify({'message': f'Connects updated successfully!'})
    
    except Exception as e:
        return jsonify({'message': f'Error updating connects: {e}'}), 500


# --- Fetch для создания заметки ---
@app.route('/create_note', methods=['POST'])
def create_note():
    data = request.json
    note_title = data['noteTitle']
    current_note_id = data['currentNoteId']
    current_note_folder = Note.query.get(current_note_id).folder
    
    # Создаём новую заметку
    new_note = Note(title=note_title, folder=current_note_folder, user=current_note_folder.user, date=date.today())
    db.session.add(new_note)
    db.session.commit()
    
    # Возвращаем ID созданной заметки
    return jsonify({'message': 'Note created', 'noteId': new_note.id})


# --- Fetch получения outlinks и backlinks заметки ---
@app.route('/get_note_connects', methods=['POST'])
def get_note_connects():
    data = request.json
    note_id = data['noteId']
    note = Note.query.get(note_id)

    backlinks = []
    for backlink in note.backlinks:
        backlinks.append({
            'id': backlink.from_note.id,
            'title': backlink.from_note.title
        })

    outlinks = []
    for outlink in note.outlinks:
        outlinks.append({
            'id': outlink.to_note.id,
            'title': outlink.to_note.title
        })

    return jsonify({
        'message': 'Connects was founded',
        'backlinks': backlinks,
        'outlinks': outlinks
    })