import os
from pathlib import Path
import logging

logging.basicConfig(level=logging.INFO, format='[%(asctime)s]: %(message)s')

def create_project_structure():
    list_of_files = [
        "sql-llm/.gitignore",
        "sql-llm/README.md",
        "sql-llm/start.sh",
        "sql-llm/backend/main.py",
        "sql-llm/backend/sql_generator.py",
        "sql-llm/backend/database.py",
        "sql-llm/backend/models.py",
        "sql-llm/backend/schemas.py",
        "sql-llm/backend/config.py",
        "sql-llm/backend/requirements.txt",
        "sql-llm/backend/.env",
        "sql-llm/frontend/components/ChatBox.jsx",
        "sql-llm/frontend/components/ResponseTable.jsx",
        "sql-llm/frontend/pages/Home.jsx",
        "sql-llm/frontend/App.js",
        "sql-llm/frontend/index.js",
        "sql-llm/frontend/package.json",
    ]

    for filepath in list_of_files:
        filepath = Path(filepath)
        filedir, filename = os.path.split(filepath)

        if filedir:
            os.makedirs(filedir, exist_ok=True)
            logging.info(f"Creating directory: {filedir} for the file: {filename}")

        if not os.path.exists(filepath) or os.path.getsize(filepath) == 0:
            with open(filepath, "w") as f:
                pass
            logging.info(f"Creating empty file: {filepath}")
        else:
            logging.info(f"{filename} already exists")

# Example usage
if __name__ == "__main__":
    create_project_structure()
