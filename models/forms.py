from flask_wtf import FlaskForm
from wtforms import StringField, PasswordField, SubmitField
from wtforms.validators import InputRequired, Length, ValidationError

from models.database import User


class RegisterForm(FlaskForm):
    name = StringField(validators=[InputRequired(), Length(min=4, max=20)])

    password = PasswordField(validators=[InputRequired(), Length(min=4, max=20)])

    submit = SubmitField("Register")

    def validate_username(self, username):
        existing_user_username = User.query.filter_by(username=username.data).first()

        if existing_user_username:
            raise ValidationError("That username is already exists. Please choose a different one")


class LoginForm(FlaskForm):
    name = StringField(validators=[InputRequired(), Length(min=4, max=20)])

    password = PasswordField(validators=[InputRequired(), Length(min=4, max=20)])

    submit = SubmitField("Login")