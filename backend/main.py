from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import get_db_connection
from sql_generator import generate_sql, generate_chart_insight
import schemas
from decimal import Decimal
from fastapi import HTTPException
from fastapi.responses import StreamingResponse
import io
import pandas as pd

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"message": "Welcome to the FastAPI SQL chatbot with Graph support!"}

@app.post("/query", response_model=schemas.QueryResponse)
async def query_database(query: schemas.QueryRequest):
    sql_query = generate_sql(query.question)

    db = get_db_connection()
    cursor = db.cursor(dictionary=True)

    result = []
    columns = []
    is_plotable = False
    chart_insight = ""

    try:
        cursor.execute(sql_query)
        result = cursor.fetchall()
        columns = cursor.column_names

        if result and len(columns) >= 2:
            for col in columns[1:]:
                val = result[0].get(col)
                if isinstance(val, (int, float, Decimal)) or (
                    isinstance(val, str) and val.replace('.', '', 1).isdigit()
                ):
                    is_plotable = True
                    break

            for row in result:
                for col in row:
                    if isinstance(row[col], Decimal):
                        row[col] = float(row[col])

        if is_plotable and result:
            chart_insight = generate_chart_insight(query.question, result)

    except Exception as e:
        result = [{"error": str(e)}]
        columns = []
        is_plotable = False
        chart_insight = f"Error: {str(e)}"
        print("❌ Error while querying:", e)

    db.close()

    return {
        "sql_query": sql_query,
        "result": result,
        "columns": columns,
        "is_plotable": is_plotable,
        "chart_insight": chart_insight
    }

@app.post("/login")
async def login(user: schemas.LoginRequest):
    db = get_db_connection()
    cursor = db.cursor(dictionary=True)

    cursor.execute("SELECT * FROM users WHERE username = %s AND password = %s", (user.username, user.password))
    user_record = cursor.fetchone()
    db.close()

    if user_record:
        return {"success": True, "message": "Login successful"}
    else:
        raise HTTPException(status_code=401, detail="Invalid username or password")

@app.post("/export")
async def export_to_excel(payload: schemas.QueryResponse):
    try:
        # Convert the result into a DataFrame
        df = pd.DataFrame(payload.result)

        # Create an Excel file in memory
        output = io.BytesIO()
        with pd.ExcelWriter(output, engine="openpyxl") as writer:
            df.to_excel(writer, index=False)

        output.seek(0)
        return StreamingResponse(
            output,
            media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            headers={
                "Content-Disposition": "attachment; filename=query_result.xlsx"
            }
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Export failed: {str(e)}")

