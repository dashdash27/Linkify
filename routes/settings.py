from app import app, db
from flask import request, jsonify

from models.database import User

# --- Fetch Update Data ---
@app.route('/update_user_data', methods=['GET', 'POST'])
def update_user_data():
    try:
        data = request.get_json()
        user_id = data['userId']
        new_username = data['newUsername']
        new_user_email = data['newUserEmail']
        new_user_color = data['newUserColor']
        new_user_avatar = data['newUserAvatar']

        user = User.query.get(user_id)

        user.name = new_username
        user.avatar = new_user_avatar
        user.color = new_user_color
        user.email = new_user_email
        db.session.commit()

        print(new_username, new_user_email, new_user_color)

        return jsonify(['good'])
    except Exception as e:
        return jsonify({'message': f'Error updating data'}), 500

