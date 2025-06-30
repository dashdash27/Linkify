from app import app
from flask import render_template, request, redirect, url_for
from flask_login import login_required, current_user
from flask_login import login_user, logout_user, login_required, current_user

from werkzeug.security import generate_password_hash, check_password_hash
from email_validator import validate_email, EmailNotValidError

from models.database import User


# --- Welcome page ---
@app.route('/')
def welcome():
    return render_template('welcome.html')


# --- Login ---
@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == "POST":
        errors = {}
        email = request.form['email'].lower()
        password = request.form['password']

        # валидация
        if not email:
            errors['email'] = "Email не может быть пустым"
        if not password:
            errors['password'] = "Пароль не может быть пустым"
        
        if errors:
            return render_template("auth/login.html", errors=errors, email=email)
        
        user = User.query.filter_by(email=email).first()

        if user and check_password_hash(user.password, password):
            login_user(user)
            current_user.get_id()
            return redirect(url_for('folders'))
        
        # сообщение, если логин и пароль не совпадают
        msg = "Некорректные пароль или email"
        msg_type = "error"
        return render_template("auth/login.html", email=email, msg=msg, msg_type=msg_type)
    else:
        return render_template("auth/login.html")


# --- Logout ---
@app.route('/logout', methods=['GET', 'POST'])
@login_required
def logout():
    logout_user()
    return redirect(url_for('welcome'))


# --- Registration ---
@app.route('/register', methods=['GET', 'POST'])
def register():
    if request.method == "POST":
        errors = {}
        name = request.form['name']
        email = request.form['email'].lower()
        password = request.form['password']
        password_rep = request.form['password_rep']

        # Валидация
        # проверка на пустые данные
        if not name:
            errors['name'] = "Username не может быть пустым"
        if not email:
            errors['email'] = "Email не может быть пустым"
        if not password:
            errors['password'] = "Password не может быть пустым"
        if not password_rep:
            errors['password_rep'] = "Confirm password не может быть пустым"

        # проверка корректности email
        try:
            validate_email(email)
        except EmailNotValidError:
            errors['email'] = "Некорректный email адрес"

        # проверка уникальности email
        existing_user = User.query.filter_by(email=email).first()
        if existing_user:
            errors['email'] = "Такой email уже занят"

        # проверка совпадения паролей
        if password != password_rep:
            errors['password'] = "Пароли не совпадают"
            errors['password_rep'] = "Пароли не совпадают"

        if errors:
            return render_template("auth/register.html", errors=errors, name=name, email=email)

        # запись информации о новом пользователе в бд
        hash = generate_password_hash(password)
        User.create(name=name, email=email, hashed_password=hash)

        # сообщение об успешной регистрации
        msg = "You have successfully registered! Please sign in to your account."
        msg_type = "success"
        return render_template("auth/login.html", email=email, msg=msg, msg_type=msg_type)
    else:
        return render_template("auth/register.html", errors={}, name="", email="")
