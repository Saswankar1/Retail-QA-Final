from pydantic import BaseModel
from typing import List, Any

class QueryRequest(BaseModel):
    question: str

class QueryResponse(BaseModel):
    sql_query: str
    result: List[dict]  
    columns: List[str]
    is_plotable: bool
    chart_insight: str

from pydantic import BaseModel

class LoginRequest(BaseModel):
    username: str
    password: str
