# Resume Parser Backend

This is the backend service for the Resume Parser application. It provides API endpoints for parsing PDF and DOCX resumes using Python libraries and NLP.

## Setup Instructions

1. Create a Python virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: .\venv\Scripts\activate
```

2. Install required packages:
```bash
pip install -r requirements.txt
python -m spacy download en_core_web_sm
```

3. Start the FastAPI server:
```bash
uvicorn resume_parser:app --reload
```

The server will start at http://localhost:8000

## API Endpoints

### POST /parse-resume
- Accepts PDF or DOCX files (max 5MB)
- Returns structured data including:
  - Personal information (email, phone)
  - Skills
  - Work experience
  - Education

## Features

- PDF and DOCX parsing
- NLP-based entity extraction
- Skills identification
- Work experience parsing
- Education history extraction

## Dependencies

- FastAPI
- PyPDF2
- python-docx
- spaCy
- python-multipart
