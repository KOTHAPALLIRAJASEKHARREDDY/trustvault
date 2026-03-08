Below is a **more polished, hackathon-ready README.md** with diagrams, demo sections, and a clear pitch. You can **copy-paste this directly** into your repository’s `README.md`.

---

# TrustVault

TrustVault is a decentralized content ownership platform that allows users to upload files, store them permanently on IPFS using Pinata, and generate verifiable proof of ownership recorded on the Sui blockchain.

Every file produces a unique CID (Content Identifier). This CID, along with file metadata and cryptographic hash, creates an immutable ownership record that can be verified publicly.

---

# Project Demo

Example verification page:

```
http://localhost:3000/verify/<CID>
```

Verification page shows:

* File CID
* Owner wallet
* File hash
* Upload timestamp
* IPFS storage link
* Blockchain transaction (if registered)
* File preview (image or PDF)

---

# Why TrustVault?

In today’s digital world, creators struggle to prove ownership of their work. TrustVault solves this problem by combining:

* Content addressing (IPFS)
* Cryptographic hashing
* Blockchain ownership records

This creates a transparent, tamper-proof verification system for digital assets.

---

# Key Features

## Decentralized Storage

Files are uploaded to IPFS through Pinata.
IPFS ensures permanent and content-addressed storage.

```
Same file → same CID
```

---

## Ownership Proof

Each upload records:

* CID
* SHA256 file hash
* Owner wallet address
* Upload timestamp

This creates a verifiable ownership proof.

---

## Blockchain Registration

Users can register ownership proof on the **Sui blockchain** via a Move smart contract.

This records:

* CID
* file hash
* owner address
* timestamp

---

## Public Verification Page

Anyone can verify ownership using:

```
/verify/<CID>
```

The page displays:

* CID
* owner wallet
* upload time
* file hash
* IPFS link
* blockchain verification

---

## Duplicate Detection

Because IPFS uses content addressing:

```
identical files → identical CID
```

TrustVault detects duplicate uploads and prevents multiple registrations.

---

## Similarity Detection (MVP)

TrustVault includes a basic similarity detection system for text files to help identify potential duplicate or plagiarized content.

---

## File Preview

The verification page supports preview for:

* Images
* PDF files

---

# Architecture

```
User
 │
 ▼
Next.js Frontend
 │
 ▼
FastAPI Backend
 │
 ├── Pinata → IPFS
 │
 ├── SQLite Database
 │
 └── Sui Blockchain
```

Flow:

```
Upload File
      │
      ▼
Backend API
      │
      ▼
Pinata → IPFS (CID generated)
      │
      ▼
Metadata stored in DB
      │
      ▼
Optional Sui blockchain proof
      │
      ▼
Public verification page
```

---

# Tech Stack

Frontend

* Next.js
* React
* Tailwind CSS
* Axios
* Sui dApp Kit

Backend

* FastAPI
* SQLAlchemy
* SQLite
* Python

Storage

* Pinata
* IPFS

Blockchain

* Sui
* Move Smart Contracts

---

# Project Structure

```
trustvault
│
├── backend
│   ├── app
│   │   ├── main.py
│   │   ├── db.py
│   │   ├── models.py
│   │   ├── pinata.py
│   │   ├── similarity.py
│   │   └── sui_verify.py
│   │
│   └── requirements.txt
│
├── frontend
│   ├── app
│   │   ├── page.tsx
│   │   ├── verify/[cid]/page.tsx
│   │   ├── components
│   │   │   ├── CopyCidButton.tsx
│   │   │   └── CopyLinkButton.tsx
│
├── trustvault_sui
│   ├── sources
│   │   └── registry.move
│
└── README.md
```

---

# Installation

## Clone Repository

```
git clone https://github.com/yourusername/trustvault.git
cd trustvault
```

---

# Backend Setup

Navigate to backend:

```
cd backend
```

Create virtual environment:

```
python -m venv .venv
```

Activate environment (Windows):

```
.venv\Scripts\activate
```

Install dependencies:

```
pip install -r requirements.txt
```

Create `.env` file:

```
PINATA_JWT=your_pinata_jwt
SUI_RPC_URL=https://fullnode.testnet.sui.io:443
SUI_PACKAGE_ID=your_package_id
SUI_REGISTRY_ID=your_registry_object
```

Run backend server:

```
uvicorn app.main:app --reload
```

Backend URL:

```
http://127.0.0.1:8000
```

---

# Frontend Setup

Navigate to frontend:

```
cd frontend
```

Install dependencies:

```
npm install
```

Start development server:

```
npm run dev
```

Frontend URL:

```
http://localhost:3000
```

---

# Deploy Smart Contract

Navigate to Move package:

```
cd trustvault_sui
```

Build contract:

```
sui move build
```

Publish contract:

```
sui client publish --gas-budget 100000000
```

After deployment, update frontend configuration with:

```
PACKAGE_ID
REGISTRY_ID
```

---

# API Endpoints

Upload file

```
POST /api/uploads
```

Form Data

```
file
title
description
owner_wallet
```

---

Fetch upload metadata

```
GET /api/uploads/{cid}
```

---

Verify blockchain status

```
GET /api/verify-onchain/{cid}
```

---

# Security

TrustVault ensures:

* content integrity through SHA256 hashing
* permanent storage through IPFS
* ownership transparency via blockchain
* prevention of duplicate uploads

---

# Future Improvements

Planned upgrades include:

* NFT ownership certificates
* AI plagiarism detection
* full on-chain CID lookup
* decentralized identity integration
* licensing and ownership transfer

---

# License

MIT License

---

# Acknowledgments

Built using:

* Sui
* Pinata
* IPFS
* FastAPI
* Next.js

---

If you want, I can also give you a **very short 5-line project description for your GitHub repo header and hackathon submission page**, which helps judges immediately understand your project.
