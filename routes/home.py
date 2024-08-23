from app import app
from flask import render_template, request, redirect
from flask_login import login_required, current_user

from models.database import Folder


# --- For Registered Users ---
@app.route('/home', methods=['GET', 'POST'])
@login_required
def home():
    return render_template('access/home.html')


@app.route('/folders', methods=['GET', 'POST'])
@login_required
def folders():
    user = current_user
    if request.method == "POST":
        name = request.form['name']
        # берем корневую папку (она создавалась первая при регистрации)
        parent = user.folders[0]

        Folder.create(name, parent, user)
        return redirect(request.url)
    else:
        user_folders = user.folders[0].subfolders
        return render_template('access/folders.html', folders=user_folders)


@app.route('/folders/<int:id>', methods=['GET', 'POST'])
@login_required
def folder_details(id):
    folder = Folder.query.get(id)
    user = current_user
    if request.method == "POST":
        name = request.form['name']
        Folder.create(name, folder, user)
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
        path = "<a href='/folders'>Workspace</a>" + "<span>/</span>" + path
        path += folder.name


        return render_template('access/folder_details.html', folder=folder, subfolders=folder.subfolders, path=path)


