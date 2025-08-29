# 🗄️ Retail Q&A Tool

An **AI-powered Retail Question Answering system** that allows users to ask **natural language queries** about retail data.  
The system automatically converts questions into **SQL queries**, fetches results from a MySQL database, and provides **visual insights** (Bar, Line, Pie, Area charts).  

Users can also **download query results as Excel files** and view AI-generated chart insights.  
Includes a simple login system and a chat-like interface to manage multiple queries.

---

## 🚀 Features
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

## 📂 Project Structure
