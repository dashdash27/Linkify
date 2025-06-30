from flask import Flask, render_template, url_for, redirect, flash, request
from models.database import db
from flask_login import login_user, logout_user, LoginManager, login_required, current_user
from werkzeug.security import generate_password_hash, check_password_hash
from email_validator import validate_email, EmailNotValidError

from models.database import User, Folder
from flask_bcrypt import Bcrypt
from sqlalchemy import text

import os

application = Flask(__name__)
app = application

bcrypt = Bcrypt(app)

# --- Для postgres ---
# app.config['SQLALCHEMY_DATABASE_URI'] = 'postgresql://linkify_user:melman@localhost:5432/Linkify'
# app.config['SECRET_KEY'] = 'secretkey'
# app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
# db.init_app(app)
# with app.app_context():
#   db.create_all() 
    
#--- Для sqlite ---
basedir = os.path.abspath(os.path.dirname(__file__))
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///' + os.path.join(basedir, 'database.db')
#app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///database.db'
app.config['SECRET_KEY'] = 'secretkey'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db.init_app(app)
with app.app_context():
    with db.engine.connect() as connection:
        connection.execute(text("PRAGMA foreign_keys=ON"))


login_manager = LoginManager()
login_manager.init_app(app)
login_manager.login_view = "login"


@login_manager.user_loader
def load_user(user_id):
    return User.query.get(int(user_id))


# --- Import all routes ---
from routes.auth import *
from routes.home import *
from routes.autosave import *
from routes.dashboard import *
from routes.settings import *


# Создаем таблицы в базе данных
with app.app_context():
    db.create_all()
    pass

if __name__ == "__main__":
    app.run(debug=True, host='0.0.0.0')
