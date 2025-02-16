from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from . import models, schemas
from typing import Optional

async def get_cv_profile(db: AsyncSession, user_id: str) -> Optional[models.CVProfile]:
    query = select(models.CVProfile).where(models.CVProfile.user_id == user_id)
    result = await db.execute(query)
    return result.scalar_one_or_none()

async def create_update_cv_profile(
    db: AsyncSession,
    profile: schemas.CVProfileCreate
) -> models.CVProfile:
    # Check if profile exists
    existing_profile = await get_cv_profile(db, profile.user_id)
    
    if existing_profile:
        # Update existing profile
        for key, value in profile.dict(exclude={'user_id'}).items():
            setattr(existing_profile, key, value)
        await db.commit()
        await db.refresh(existing_profile)
        return existing_profile
    
    # Create new profile
    db_profile = models.CVProfile(**profile.dict())
    db.add(db_profile)
    await db.commit()
    await db.refresh(db_profile)
    return db_profile
