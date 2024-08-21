from flask import Flask, render_template, url_for, redirect, flash
from models.database import db
from flask_login import login_user, logout_user, LoginManager, login_required

from models.database import User, Folder
from models.forms import LoginForm, RegisterForm

from flask_bcrypt import Bcrypt


app = Flask(__name__)
bcrypt = Bcrypt(app)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///database.db'
app.config['SECRET_KEY'] = 'secretkey'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db.init_app(app)

login_manager = LoginManager()
login_manager.init_app(app)
login_manager.login_view = "login"


@login_manager.user_loader
def load_user(user_id):
    return User.query.get(int(user_id))


@app.route('/')
@app.route('/welcome')
def welcome():
    #db.session.query(User).delete()
    #db.session.commit()
    return render_template('welcome.html')


# --- For auth ---
@app.route('/login', methods=['GET', 'POST'])
def login():
    form = LoginForm()
    if form.validate_on_submit():
        user = User.query.filter_by(name=form.name.data).first()
        if user:
            if bcrypt.check_password_hash(user.password, form.password.data):
                login_user(user)
                return redirect(url_for('home'))
            else:
                flash('Username or password is incorrect')
        else:
            flash('Username or password is incorrect')

    return render_template('auth/login.html', form=form)


@app.route('/logout', methods=['GET', 'POST'])
@login_required
def logout():
    logout_user()
    return redirect(url_for('login'))


@app.route('/register', methods=['GET', 'POST'])
def register():
    form = RegisterForm()

    if form.validate_on_submit():
        user = User.query.filter_by(name=form.name.data).first()
        if user:
            flash('This username already exists')
        else:
            hashed_password = bcrypt.generate_password_hash(form.password.data)
            User.create(form.name.data, hashed_password)
            return redirect(url_for('login'))

    return render_template('auth/register.html', form=form)


# --- Import all routes ---
from routes.home import *


if __name__ == "__main__":
    app.run(debug=True)