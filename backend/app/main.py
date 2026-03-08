from fastapi import FastAPI, UploadFile, File, Form, HTTPException, Depends
from sqlalchemy.orm import Session
from datetime import datetime
from typing import Generator
from fastapi.middleware.cors import CORSMiddleware

from app.db import Base, engine, SessionLocal
from app.models import Upload
from app.pinata import upload_to_pinata
from app.similarity import sha256_bytes, text_similarity
from app.sui_verify import verify_cid_on_chain

app = FastAPI(title="TrustVault API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

Base.metadata.create_all(bind=engine)


def get_db() -> Generator:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@app.get("/")
def root():
    return {"message": "TrustVault API running"}


@app.get("/api/uploads/{cid}")
def get_upload(cid: str, db: Session = Depends(get_db)):
    row = db.query(Upload).filter(Upload.cid == cid).first()
    if not row:
        raise HTTPException(status_code=404, detail="Upload not found")

    return {
        "success": True,
        "data": {
            "title": row.title,
            "description": row.description,
            "owner_wallet": row.owner_wallet,
            "original_filename": row.original_filename,
            "mime_type": row.mime_type,
            "size_bytes": row.size_bytes,
            "cid": row.cid,
            "file_hash": row.file_hash,
            "uploaded_at": row.uploaded_at.isoformat(),
            "blockchain_tx": row.blockchain_tx,
            "similarity_score": row.similarity_score,
            "similar_to_cid": row.similar_to_cid,
            "gateway_url": f"https://gateway.pinata.cloud/ipfs/{row.cid}",
        },
    }


@app.get("/api/verify-onchain/{cid}")
def verify_onchain(cid: str):
    try:
        result = verify_cid_on_chain(cid)
        return {
            "success": True,
            "data": result,
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/uploads/{cid}/tx")
def update_tx(cid: str, tx: str = Form(...), db: Session = Depends(get_db)):
    row = db.query(Upload).filter(Upload.cid == cid).first()

    if not row:
        raise HTTPException(status_code=404, detail="Upload not found")

    row.blockchain_tx = tx
    db.commit()
    db.refresh(row)
    print("Saved blockchain tx:", row.blockchain_tx)
    return {
        "success": True,
        "cid": row.cid,
        "blockchain_tx": row.blockchain_tx,
        }

@app.post("/api/uploads")
async def create_upload(
    file: UploadFile = File(...),
    owner_wallet: str = Form(...),
    title: str = Form(...),
    description: str = Form(""),
    db: Session = Depends(get_db),
):
    try:
        content = await file.read()
        file_hash = sha256_bytes(content)

        similarity_score = None
        similar_to_cid = None

        if (file.content_type or "").startswith("text/"):
            current_text = content.decode("utf-8", errors="ignore")

            previous_rows = db.query(Upload).filter(
                Upload.mime_type.like("text/%")
            ).all()

            previous_texts = []

            for row in previous_rows:
                if row.description:
                    previous_texts.append((row.cid, row.description))

            match_cid, score = text_similarity(current_text, previous_texts)
            similar_to_cid = match_cid
            similarity_score = str(score)

        pinata_result = upload_to_pinata(
            file_obj=content,
            filename=file.filename,
            content_type=file.content_type or "application/octet-stream",
        )

        existing = db.query(Upload).filter(Upload.cid == pinata_result["cid"]).first()

        if existing:
            return {
                "success": False,
                "duplicate": True,
                "message": "This file is already registered in TrustVault. Because IPFS uses content addressing, identical files produce the same CID.",
                "data": {
                    "cid": existing.cid,
                    "gateway_url": f"https://gateway.pinata.cloud/ipfs/{existing.cid}",
                    "verify_url": f"/verify/{existing.cid}",
                },
            }

        record = Upload(
            title=title,
            description=description,
            owner_wallet=owner_wallet,
            original_filename=file.filename,
            mime_type=file.content_type,
            size_bytes=len(content),
            cid=pinata_result["cid"],
            file_hash=file_hash,
            uploaded_at=datetime.utcnow(),
            blockchain_tx=None,
            similarity_score=similarity_score,
            similar_to_cid=similar_to_cid,
        )

        db.add(record)
        db.commit()
        db.refresh(record)

        return {
            "success": True,
            "message": "File uploaded successfully.",
            "duplicate": False,
            "data": {
                "title": record.title,
                "description": record.description,
                "owner_wallet": record.owner_wallet,
                "original_filename": record.original_filename,
                "mime_type": record.mime_type,
                "size_bytes": record.size_bytes,
                "cid": record.cid,
                "file_hash": record.file_hash,
                "uploaded_at": record.uploaded_at.isoformat(),
                "blockchain_tx": record.blockchain_tx,
                "similarity_score": record.similarity_score,
                "similar_to_cid": record.similar_to_cid,
                "gateway_url": f"https://gateway.pinata.cloud/ipfs/{record.cid}",
                "verify_url": f"/verify/{record.cid}",
            },
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))