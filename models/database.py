from flask_sqlalchemy import SQLAlchemy
from flask_login import UserMixin
from sqlalchemy.orm import relationship

db = SQLAlchemy()


class User(db.Model, UserMixin):
    __tablename__ = 'users'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(30), nullable=False)
    email = db.Column(db.String(100), nullable=False)
    password = db.Column(db.String(512), nullable=False)
    color = db.Column(db.String(7), nullable=False, default="#07babf")
    avatar = db.Column(db.String(7), nullable=False, default="0")

    folders = relationship("Folder", back_populates="user", cascade="all, delete-orphan", passive_deletes=True)
    notes = relationship("Note", back_populates="user", cascade="all, delete-orphan", passive_deletes=True)

    @classmethod
    def create(cls, name, email, hashed_password):
        new_user = User(name=name, email=email, password=hashed_password)
        # создаем корневую папку
        root_folder = Folder(name="root_folder")
        new_user.folders = [root_folder]

        db.session.add(new_user)
        db.session.commit()


class Note(db.Model):
    __tablename__ = 'notes'
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(100), nullable=False)
    content = db.Column(db.Text)
    date = db.Column(db.DateTime)

    user_id = db.Column(db.Integer(), db.ForeignKey('users.id', ondelete="CASCADE"))
    folder_id = db.Column(db.Integer(), db.ForeignKey('folders.id', ondelete="CASCADE"))

    user = relationship("User", back_populates="notes", passive_deletes=True)
    folder = relationship("Folder", back_populates="notes", passive_deletes=True)
    
    backlinks = relationship(
        "Connect",
        foreign_keys='Connect.to_note_id',
        back_populates="to_note",
        cascade="all, delete-orphan",
        passive_deletes=True
    )
    outlinks = relationship(
        "Connect",
        foreign_keys='Connect.from_note_id',
        back_populates="from_note",
        cascade="all, delete-orphan",
        passive_deletes=True
    )

    def set_content(self, content):
        self.content = content
        db.session.commit()


    def set_title(self, title):
        self.title = title
        db.session.commit()


    def add_outlink(self, target_note):
        "Добавляет исходящую ссылку и автоматически создает обратную"
        if not any(link.to_note_id == target_note.id for link in self.outlinks):
            new_link = Connect(from_note=self, to_note=target_note)
            self.outlinks.append(new_link)
            db.session.commit()


    def update_outlinks(self, new_outlink_ids):
        for connect in self.outlinks:
            db.session.delete(connect)
        
        # Добавление новых связей
        for outlink_id in new_outlink_ids:
            outlink_note = Note.query.get(outlink_id)
            self.add_outlink(outlink_note)

        db.session.commit()

        
    def get_outlinks(self):
        """Возвращает список outlinks"""
        return [link.to_note for link in self.outlinks]
    
    def get_backlinks(self):
        return [link.from_note for link in self.backlinks]

    @classmethod
    def create(cls, name, parent, user, date):
        new_note = Note(title=name, folder=parent, user=user, date=date, content="")

        db.session.add(new_note)
        db.session.commit()


class Folder(db.Model):
    __tablename__ = 'folders'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(30), nullable=False)
    parent_id = db.Column(db.Integer(), db.ForeignKey('folders.id', ondelete="CASCADE"))
    user_id = db.Column(db.Integer(), db.ForeignKey('users.id', ondelete="CASCADE"))

    user = relationship("User", back_populates="folders", passive_deletes=True)
    notes = relationship("Note", back_populates="folder", cascade="all, delete-orphan", passive_deletes=True)
    subfolders = relationship("Folder", back_populates='parent', cascade="all, delete-orphan", passive_deletes=True)
    parent = relationship("Folder", back_populates='subfolders', remote_side=id, passive_deletes=True)

    @classmethod
    def create(cls, name, parent, user):
        new_folder = Folder(name=name, parent=parent, user=user)

        db.session.add(new_folder)
        db.session.commit()

class Connect(db.Model):
    __tablename__ = 'connects'
    id = db.Column(db.Integer, primary_key=True)
    from_note_id = db.Column(db.Integer(), db.ForeignKey('notes.id', ondelete="CASCADE"))
    to_note_id = db.Column(db.Integer(), db.ForeignKey('notes.id', ondelete="CASCADE"))

    from_note = relationship(
        "Note", 
        foreign_keys=[from_note_id], 
        back_populates="outlinks",
        cascade="all, delete",
        passive_deletes=True
    )
    to_note = relationship(
        "Note", 
        foreign_keys=[to_note_id], 
        back_populates="backlinks",
        cascade="all, delete",
        passive_deletes=True
    )
