from app import app, db
from flask import render_template, request, jsonify
from flask_login import login_required, current_user

from models.database import Folder, Note, Connect
from datetime import date

from sqlalchemy import func, exists

# --- Количество элементов ---
def count_notes(user_id):
    return Note.query.filter_by(user_id=user_id).count()

def count_folders(user_id):
    return Folder.query.filter_by(user_id=user_id).count()

def count_links(user_id):
    return db.session.query(func.count()).\
        select_from(Connect).\
        join(Note, (Connect.from_note_id == Note.id) | (Connect.to_note_id == Note.id)).\
        filter(Note.user_id == user_id).\
        scalar()

# --- Процент связанных заметок ---
def connected_percent(user_id):
    total_notes = db.session.query(func.count(Note.id)).filter(Note.user_id == user_id).scalar()

    if total_notes == 0:
        return 0
    
    connected_notes = db.session.query(func.count(Note.id)).filter(
        Note.user_id == user_id,
        exists().where(Connect.from_note_id == Note.id) | exists().where(Connect.to_note_id == Note.id)
    ).scalar()

    percentage = (connected_notes / total_notes) * 100
    return round(percentage)


# --- Fetch для bar-диаграммы (backs) ---
@app.route('/get_greatest_backs', methods=['GET', 'POST'])
def get_greatest_backs():

    try:
        data = request.get_json()
        user_id = data['userId']

        lim = 7

        notes_with_backlinks = db.session.query(
        Note.id, Note.title, func.count(Connect.id).label('backlinks_count')
        ).outerjoin(Connect, Connect.to_note_id == Note.id).filter(Note.user_id == user_id).group_by(Note.id, Note.title).order_by(func.count(Connect.id).desc()).limit(lim).all()
        dataset = [[note[2], note[1].strip(), note[0]] for note in notes_with_backlinks]

        print(dataset)

        return jsonify(dataset)
    except Exception as e:
        return jsonify({'message': f'Error getting greatest backs'}), 500


# --- Fetch для bar-диаграммы (outs) ---
@app.route('/get_greatest_outs', methods=['GET', 'POST'])
def get_greatest_outs():
    try:
        data = request.get_json()
        user_id = data['userId']

        lim = 7 # предел по количеству

        notes_with_outlinks = db.session.query(
            Note.id, Note.title, func.count(Connect.id).label('outlinks_count')
        ).outerjoin(Connect, Connect.from_note_id == Note.id).filter(Note.user_id == user_id).group_by(Note.id, Note.title).order_by(func.count(Connect.id).desc()).limit(lim).all()

        dataset = [[note[2], note[1].strip(), note[0]] for note in notes_with_outlinks]

        return jsonify(dataset)
    
    except Exception as e:
        return jsonify({'message': f'Error getting greatest outlinks'}), 500
    

# --- Fetch для bar-диаграммы (total) ---
@app.route('/get_greatest_total_links', methods=['GET', 'POST'])
def get_greatest_total_links():
    try:
        data = request.get_json()
        user_id = data['userId']

        lim = 7

        notes_with_backlinks = db.session.query(
            Note.id, Note.title, func.count(Connect.id).label('backlinks_count')
        ).outerjoin(Connect, Connect.to_note_id == Note.id).filter(Note.user_id == user_id).group_by(Note.id, Note.title).all()

        notes_with_outlinks = db.session.query(
            Note.id, Note.title, func.count(Connect.id).label('outlinks_count')
        ).outerjoin(Connect, Connect.from_note_id == Note.id).filter(Note.user_id == user_id).group_by(Note.id, Note.title).all()

        # Объединение результатов
        notes_with_total_links = {}
        for note in notes_with_backlinks:
            notes_with_total_links[note[0]] = {'id': note[0], 'title': note[1], 'total_links': note[2]}
        for note in notes_with_outlinks:
            if note[0] in notes_with_total_links:
                notes_with_total_links[note[0]]['total_links'] += note[2]
            else:
                notes_with_total_links[note[0]] = {'id': note[0], 'title': note[1], 'total_links': note[2]}

        # Сортировка и ограничение
        sorted_notes = sorted(notes_with_total_links.values(), key=lambda x: x['total_links'], reverse=True)[:lim]

        dataset = [[note['total_links'], note['title'], note['id']] for note in sorted_notes]

        return jsonify(dataset)
    
    except Exception as e:
        return jsonify({'message': f'Error getting greatest outlinks'}), 500


# --- Fetch Cluster chart ---
def find_connected_components(user_id):
    # Получаем все заметки пользователя
    notes = Note.query.filter_by(user_id=user_id).all()
    
    # Создаем словарь для хранения посещенных заметок
    visited = {note.id: False for note in notes}
    
    # Создаем список для хранения компонентов связности
    components = []
    
    # Итерируем по всем заметкам
    for note in notes:
        if not visited[note.id]:
            # Если заметка не посещена, запускаем DFS
            component = []
            dfs(note.id, visited, component)
            components.append(component)
    
    # Преобразуем компоненты в списки названий заметок
    result = []
    for component in components:
        titles = [[Note.query.get(note_id).title.strip(), note_id] for note_id in component]
        result.append(titles)

    result.sort(key=lambda x: len(x), reverse=True)
    
    return result


# --- Обход графа в глубину ---
def dfs(note_id, visited, component):
    # Помечаем заметку как посещенную
    visited[note_id] = True
    component.append(note_id)
    
    # Получаем все связанные заметки
    connected_notes = db.session.query(Connect).filter((Connect.from_note_id == note_id) | (Connect.to_note_id == note_id)).all()
    
    # Итерируем по связанным заметкам
    for conn in connected_notes:
        other_note_id = conn.from_note_id if conn.to_note_id == note_id else conn.to_note_id
        if not visited[other_note_id]:
            # Если связанная заметка не посещена, запускаем DFS
            dfs(other_note_id, visited, component)


# --- Обход графа в глубину ---
@app.route('/get_connected_components', methods=['GET', 'POST'])
def get_connected_components():
    try:
        data = request.get_json()
        user_id = data['userId']
        
        components = find_connected_components(user_id)

        return jsonify(components)
    
    except Exception as e:
        return jsonify({'message': f'Error getting connected components'}), 500


# --- Панель с dashboard ---
@app.route('/dashboard', methods=['GET', 'POST'])
@login_required
def dashboard():
    # для блока количества
    notes_count = count_notes(current_user.id)
    folders_count = count_folders(current_user.id) - 1
    links_count = int(count_links(current_user.id) / 2)
    elements_count = notes_count + folders_count + links_count
    connected_notes_percent = connected_percent(current_user.id)

    notes_without_links = Note.query.filter(
        Note.id.notin_(
            db.session.query(Connect.from_note_id).union(
                db.session.query(Connect.to_note_id)
            )
        )
    ).all()

    notes_without_links_data = [[note.id, note.title] for note in notes_without_links]

    return render_template('access/dashboard.html', 
                           notes_count=notes_count,
                           folders_count=folders_count,
                           links_count=links_count,
                           elements_count=elements_count,
                           connected_notes_percent=connected_notes_percent,
                           notes_without_links_data=notes_without_links_data
                           )
