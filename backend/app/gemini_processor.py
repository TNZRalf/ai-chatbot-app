import google.generativeai as genai
import json
import re
from typing import Dict, Any
import os
from dotenv import load_dotenv

load_dotenv()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
genai.configure(api_key=GEMINI_API_KEY)

PROMPT_TEMPLATE = """
Extract the following information from this CV in a structured format:
1. Personal Information (name, email, phone, location, LinkedIn, GitHub)
2. Summary/Profile
3. Education (institution, degree, dates)
4. Work Experience (company, position, dates, highlights)
5. Skills
6. Languages
7. Certifications

Format the response as a JSON object with these exact keys:
{
    "personalInfo": {
        "name": "",
        "email": "",
        "phone": "",
        "location": "",
        "linkedin": "",
        "github": ""
    },
    "summary": "",
    "education": [
        {
            "institution": "",
            "degree": "",
            "startDate": "YYYY-MM-DD",
            "endDate": "YYYY-MM-DD"
        }
    ],
    "experience": [
        {
            "company": "",
            "position": "",
            "startDate": "YYYY-MM-DD",
            "endDate": "YYYY-MM-DD",
            "highlights": []
        }
    ],
    "skills": [],
    "languages": [
        {
            "name": "",
            "proficiency": ""
        }
    ],
    "certifications": []
}

Rules:
1. Keep responses under 1024 tokens
2. Use exact values from resume
3. For current positions/education, use 'Present' as the end date
4. Format dates as YYYY-MM-DD
5. Include language proficiency levels
6. Return ONLY the JSON, no additional text
7. If a field is not found, use an empty string or empty list
8. Never return null values

CV Content:
{content}
"""

model = genai.GenerativeModel(
    model_name="gemini-pro",
    generation_config={
        "temperature": 0.7,
        "max_output_tokens": 2048,
    }
)

async def parse_with_gemini(content: str) -> Dict[str, Any]:
    try:
        # Generate content with Gemini
        response = model.generate_content(PROMPT_TEMPLATE.format(content=content))
        response_text = response.text.strip()
        
        # Extract JSON from response
        json_match = re.search(r'({[\s\S]*})', response_text)
        if not json_match:
            raise ValueError("No JSON found in response")
            
        # Parse and validate JSON
        extracted_data = json.loads(json_match.group(1))
        
        # Ensure all required fields exist
        required_fields = [
            "personalInfo", "summary", "education", "experience",
            "skills", "languages", "certifications"
        ]
        for field in required_fields:
            if field not in extracted_data:
                extracted_data[field] = [] if field in ["education", "experience", "skills", "languages", "certifications"] else ""
                
        return extracted_data
        
    except Exception as e:
        raise ValueError(f"Failed to parse CV with Gemini: {str(e)}")
