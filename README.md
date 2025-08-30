
# 🗄️ Retail Q&A Tool

An **AI-powered Retail Question Answering system** that allows users to ask **natural language queries** about retail data.  
The system automatically converts questions into **SQL queries**, fetches results from a MySQL database, and provides **visual insights** (Bar, Line, Pie, Area charts).  

Users can also **download query results as Excel files** and view AI-generated chart insights.  
Includes a simple login system and a chat-like interface to manage multiple queries.

---

## Features
- 📝 **Natural Language → SQL** conversion using **Google Gemini**  
- 📊 **Auto chart generation** (Bar, Line, Area, Pie) with AI-generated insights  
- 📂 **Export results to Excel**  
- 💬 **Chat-like interface** with multiple chats and session history  
- 🔒 **User login** system  
- 🎨 Interactive **frontend dashboard (React + Recharts)**  
- ⚡ **Backend powered by FastAPI** with MySQL integration  

---

## 🛠️ Tech Stack

### Frontend
- React (Hooks, useState, useEffect)  
- Axios (API calls)  
- Recharts (Charts & Visualization)  
- FileSaver + xlsx (Excel download)  

### Backend
- FastAPI (Python 3.10+)  
- MySQL (database connection)  
- Pandas (Excel export)  
- Google Gemini API (SQL & chart insights)  

---

## ⚙️ Setup Instructions

### 1️⃣ Clone the Repo
```bash
git clone https://github.com/Saswankar1/Retail-QA-Final.git
cd Retail-QA-Final
````

### 2️⃣ Backend Setup (FastAPI + MySQL)

```bash
cd backend
python -m venv venv
source venv/bin/activate   # (Linux/Mac)
venv\Scripts\activate      # (Windows)

pip install -r requirements.txt
```

Create a `.env` file inside `backend/` with:

```env
GEMINI_API_KEY=your_google_gemini_key
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=yourpassword
DB_NAME=retail_db
```

Run backend:

```bash
uvicorn main:app --reload
```

Backend will start at: **[http://127.0.0.1:8000](http://127.0.0.1:8000)**

---

### 3️⃣ Frontend Setup (React)

```bash
cd frontend
npm install
npm start
```

Frontend will start at: **[http://localhost:3000](http://localhost:3000)**

---

## ▶️ Usage

1. Open `http://localhost:3000`
2. Login with your credentials (`users` table in MySQL handles login)
3. Start a **new chat** and type a question, e.g.:

   * *"Show total sales by product category as a bar chart"*
   * *"What are the top 5 products with highest revenue?"*
4. The system:

   * Converts your question → SQL
   * Fetches results from MySQL
   * Displays results in **table + charts**
   * Provides **AI insights** under the chart
5. Optionally, download results as Excel.

---

## 📌 API Endpoints

* `POST /query` → Generate SQL & return results + insights
* `POST /login` → Authenticate user
* `POST /export` → Export query results as Excel
* `GET /` → Health check

---

## 🔮 Future Improvements

* ✅ Role-based user management
* ✅ Upload CSV/Excel → Auto-create DB tables
* ✅ Support PostgreSQL/SQLite along with MySQL
* ✅ More visualization options (scatter, heatmaps)
* ✅ Deployable on AWS/GCP with Docker

---

## 🤝 Contributing

Pull requests are welcome! Please open an issue first to discuss your idea.
