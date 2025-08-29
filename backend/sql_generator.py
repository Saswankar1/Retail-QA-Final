import google.generativeai as genai
import os
import re
from dotenv import load_dotenv
from database import get_table_schema

# Load API Key
load_dotenv()
api_key = os.getenv("GEMINI_API_KEY")
if not api_key:
    raise ValueError("❌ GEMINI_API_KEY is missing! Add it to your .env file.")

genai.configure(api_key=api_key)

def clean_sql_response(response_text: str) -> str:
    if not response_text:
        return "Error: Empty response from AI"
    return re.sub(r"```sql\s*|\s*```", "", response_text, flags=re.MULTILINE).strip()

def generate_sql(question: str) -> str:
    schema = get_table_schema()
    schema_info = "\n".join(
        [f"Table `{table}`: Columns {', '.join(cols)}" for table, cols in schema.items()]
    )

    prompt = f"""
    Convert the following natural language question into a valid MySQL query.

    **Question:** {question}

    **Database Schema:**
    {schema_info}

    **Guidelines:**
    - Use correct table and column names.
    - Use JOIN when needed.
    - Use WHERE for filtering, COUNT() for counting, and SUM() for totals.
    - If the question mentions "bar chart", "plot", or "graph", return at least one numeric column.
    - Return only the SQL query without code blocks.
    """

    try:
        model = genai.GenerativeModel("gemini-1.5-pro-latest")
        response = model.generate_content(prompt)
        sql_query = response.text if hasattr(response, "text") else "Error: No valid response from AI"
        return clean_sql_response(sql_query)
    except Exception as e:
        return f"Error generating SQL: {str(e)}"

def generate_chart_insight(question: str, data: list[dict]) -> str:
    """Generate a chart summary/insight using Gemini."""
    try:
        model = genai.GenerativeModel("gemini-1.5-pro-latest")

        example_data = "\n".join([str(row) for row in data[:5]])  # Show only first 5 rows

        prompt = f"""
        The user asked: "{question}"
        Based on this data, give a brief and insightful summary suitable for showing below a chart.

        Sample data:
        {example_data}

        Guidelines:
        - Keep it short and clear (1-2 sentences).
        - Mention trends, patterns, or highlights if any.
        - Return insights in bullet points, each point should be a clear and concise sentence.
        """

        response = model.generate_content(prompt)
        
        # Process the response to ensure no unwanted characters or empty lines
        insights = response.text.strip()

        if insights:
            # Clean the response: remove any extra bullet characters and empty lines
            bullet_points = insights.split("\n")
            formatted_insights = "\n".join(
                [f"{point.strip().lstrip('*').strip()}" for i, point in enumerate(bullet_points) if point.strip()]
            )
            return formatted_insights
        else:
            return "No insights generated."

    except Exception as e:
        return f"Error generating insight: {str(e)}"
