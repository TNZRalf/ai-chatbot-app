from fastapi import APIRouter, Depends, File, UploadFile, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from .. import crud, schemas, gemini_processor
from ..database import get_db
from typing import Optional
import PyPDF2
import docx
import io

router = APIRouter()

async def extract_text_from_file(file: UploadFile) -> str:
    content = await file.read()
    text = ""
    
    try:
        if file.filename.endswith('.pdf'):
            pdf_reader = PyPDF2.PdfReader(io.BytesIO(content))
            text = "\n".join(page.extract_text() for page in pdf_reader.pages)
        
        elif file.filename.endswith('.docx'):
            doc = docx.Document(io.BytesIO(content))
            text = "\n".join(paragraph.text for paragraph in doc.paragraphs)
        
        elif file.filename.endswith('.txt'):
            text = content.decode('utf-8')
        
        else:
            raise HTTPException(
                status_code=400,
                detail="Unsupported file format. Please upload PDF, DOCX, or TXT files."
            )
            
        return text
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error processing file: {str(e)}"
        )

@router.post("/process", response_model=schemas.CVProfileResponse)
async def process_cv(
    file: UploadFile = File(...),
    user_id: str = "test_user",  # Replace with actual user auth
    db: AsyncSession = Depends(get_db)
):
    try:
        # 1. Extract text from file
        text_content = await extract_text_from_file(file)
        
        # 2. Process with Gemini AI
        parsed_data = await gemini_processor.parse_with_gemini(text_content)
        
        # 3. Create CV profile
        profile_data = schemas.CVProfileCreate(
            user_id=user_id,
            **parsed_data
        )
        
        # 4. Save to database
        result = await crud.create_update_cv_profile(db, profile_data)
        return result
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error processing CV: {str(e)}"
        )

@router.get("/profile/{user_id}", response_model=schemas.CVProfileResponse)
async def get_cv_profile(
    user_id: str,
    db: AsyncSession = Depends(get_db)
):
    profile = await crud.get_cv_profile(db, user_id)
    if not profile:
        raise HTTPException(
            status_code=404,
            detail="CV profile not found"
        )
    return profile
