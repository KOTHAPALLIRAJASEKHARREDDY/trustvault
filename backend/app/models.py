from sqlalchemy import Column, Integer, String, DateTime
from datetime import datetime
from app.db import Base

class Upload(Base):
    __tablename__ = "uploads"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    description = Column(String, nullable=True)
    owner_wallet = Column(String, nullable=False, index=True)
    original_filename = Column(String, nullable=False)
    mime_type = Column(String, nullable=True)
    size_bytes = Column(Integer, nullable=True)
    cid = Column(String, unique=True, nullable=False, index=True)
    file_hash = Column(String, nullable=False)
    uploaded_at = Column(DateTime, default=datetime.utcnow)
    blockchain_tx = Column(String, nullable=True)
    similarity_score = Column(String, nullable=True)
    similar_to_cid = Column(String, nullable=True)