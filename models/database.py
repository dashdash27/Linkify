from flask_sqlalchemy import SQLAlchemy
from flask_login import UserMixin
from sqlalchemy.orm import relationship

db = SQLAlchemy()


class User(db.Model, UserMixin):
    __tablename__ = 'users'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(20), nullable=False, unique=True)
    password = db.Column(db.String(80), nullable=False)
    color = db.Column(db.String(7), nullable=False, default="#07babf")

    folders = relationship("Folder", back_populates="user")
    notes = relationship("Note", back_populates="user")

    @classmethod
    def create(cls, name, hashed_password):
        new_user = User(name=name, password=hashed_password)
        # создаем корневую папку
        root_folder = Folder(name="root_folder")
        new_user.folders = [root_folder]

        db.session.add(new_user)
        db.session.commit()


class Note(db.Model):
    __tablename__ = 'notes'
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(30), nullable=False)
    content = db.Column(db.Text)
    date = db.Column(db.DateTime)

    user_id = db.Column(db.Integer(), db.ForeignKey('users.id'))
    folder_id = db.Column(db.Integer(), db.ForeignKey('folders.id'))

    user = relationship("User", back_populates="notes")
    folder = relationship("Folder", back_populates="notes")
    backlinks = relationship("Connect", foreign_keys='Connect.to_note_id', back_populates="to_note")
    outlinks = relationship("Connect", foreign_keys='Connect.from_note_id', back_populates="from_note")


class Folder(db.Model):
    __tablename__ = 'folders'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(30), nullable=False)
    parent_id = db.Column(db.Integer(), db.ForeignKey('folders.id'))
    user_id = db.Column(db.Integer(), db.ForeignKey('users.id'))

    user = relationship("User", back_populates="folders")
    notes = relationship("Note", back_populates="folder")
    subfolders = relationship("Folder", back_populates='parent')
    parent = relationship("Folder", back_populates='subfolders', remote_side=id)

    @classmethod
    def create(cls, name, parent, user):
        new_folder = Folder(name=name, parent=parent, user=user)

        db.session.add(new_folder)
        db.session.commit()

class Connect(db.Model):
    __tablename__ = 'connects'
    id = db.Column(db.Integer, primary_key=True)
    from_note_id = db.Column(db.Integer(), db.ForeignKey('notes.id'))
    to_note_id = db.Column(db.Integer(), db.ForeignKey('notes.id'))

    from_note = relationship("Note", foreign_keys=[from_note_id])
    to_note = relationship("Note", foreign_keys=[to_note_id])