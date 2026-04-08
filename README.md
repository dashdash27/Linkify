# Linkify — Personal Knowledge Management System 🧠

Linkify is a web-based service for non-linear note-taking inspired by the **Zettelkasten** method. It enables users to build a "second brain" by creating semantic links between different pieces of information, making learning and knowledge organization more effective.

---

### 📸 Interface Preview

<img width="100%" height="1080" alt="linkify-ui" src="https://github.com/user-attachments/assets/9abe2b08-208b-4d9c-9f35-914e82b51d14" />

---

### 🚀 Key Engineering Challenges

#### 🔗 Complex Data Modeling
Designed a **Self-referencing (Recursive) Many-to-Many** relationship model in PostgreSQL. This allows notes to be interconnected in a non-linear graph structure, enabling bi-directional linking and deep knowledge discovery.

#### 📊 Dynamic Analytics Dashboard
Engineered a custom data visualization panel using **Vanilla JS** (without external libraries) to track knowledge base connectivity metrics and database growth.

#### 🧩 Modular UI Architecture
Implemented **Jinja2 Macros** to build a reusable component system (modals, context menus, navigation). This significantly reduced code duplication and improved frontend maintainability.

---

### 🛠 Tech Stack

- **Backend:** Python (Flask), PostgreSQL, SQLAlchemy (ORM).
- **Frontend:** Vanilla JavaScript (ES6+), HTML5, CSS3 (Custom Themes).
- **Core Features:** AJAX, Jinja2 Macros, Recursive Data Structures.

---

### 🎨 Features

- **Semantic Linking:** Connect notes to create a web of knowledge.
- **Rich Content:** Support for text formatting and image embedding.
- **Personalization:** 
    - Light/Dark theme support.
    - Custom accent colors and avatars.
- **Full Responsiveness:** Optimized for Mobile, Tablet, and Desktop.
- **Dashboard:** Real-time analytics of your note connections and progress.

---

### ⚙️ Local Development Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/dashdash27/Linkify.git
   cd linkify
   ```
2. **Set up a virtual environment**
	```bash
 	python -m venv venv
	source venv/bin/activate  # On Windows: venv\Scripts\activate
 	```
3.  **Install dependencies**
	```bash
 	pip install -r requirements.txt
 	```
4.  **Run the application**
	```bash
 	python app.py
 	```
	
_The app will be available at http://127.0.0.1:5000_
