"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { useCurrentAccount, useDAppKit } from "@mysten/dapp-kit-react";
import dynamic from "next/dynamic";
import { Transaction } from "@mysten/sui/transactions";
import {
  PACKAGE_ID,
  REGISTRY_ID,
  SUI_CLOCK_ID,
  MODULE_NAME,
  FUNCTION_NAME,
} from "./lib/sui";

const ConnectButton = dynamic(
  () => import("@mysten/dapp-kit-react/ui").then((mod) => mod.ConnectButton),
  { ssr: false },
);

type UploadResult = {
  title: string;
  description: string;
  owner_wallet: string;
  original_filename: string;
  mime_type: string;
  size_bytes: number;
  cid: string;
  file_hash: string;
  uploaded_at: string;
  blockchain_tx: string | null;
  similarity_score: string | null;
  similar_to_cid: string | null;
  gateway_url: string;
  verify_url: string;
};

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [ownerWallet, setOwnerWallet] = useState("");
  const [result, setResult] = useState<UploadResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedFileName, setSelectedFileName] = useState("");
  const [statusType, setStatusType] = useState<
    "success" | "duplicate" | "error" | ""
  >("");
  const [message, setMessage] = useState("");
  const [suiTxDigest, setSuiTxDigest] = useState("");

  const account = useCurrentAccount();
  const dAppKit = useDAppKit();

  useEffect(() => {
    if (account?.address) {
      setOwnerWallet(account.address);
    }
  }, [account]);

  const registerOnSui = async (cid: string, fileHash: string) => {
    if (!account) {
      throw new Error("Please connect your Sui wallet.");
    }

    const tx = new Transaction();

    tx.moveCall({
      target: `${PACKAGE_ID}::${MODULE_NAME}::${FUNCTION_NAME}`,
      arguments: [
        tx.object(REGISTRY_ID),
        tx.pure.string(cid),
        tx.pure.string(fileHash),
        tx.object(SUI_CLOCK_ID),
      ],
    });

    const result = await dAppKit.signAndExecuteTransaction({
      transaction: tx,
    });

    if ("FailedTransaction" in result && result.FailedTransaction) {
      throw new Error(
        result.FailedTransaction.status.error?.message ||
          "Sui transaction failed.",
      );
    }

    if ("Transaction" in result && result.Transaction) {
      return result.Transaction.digest;
    }

    throw new Error("No transaction digest returned.");
  };

  const handleUpload = async () => {
    if (!file) {
      setStatusType("error");
      setMessage("Please choose a file.");
      return;
    }

    if (!title.trim()) {
      setStatusType("error");
      setMessage("Please enter a title.");
      return;
    }

    if (!ownerWallet.trim()) {
      setStatusType("error");
      setMessage("Please connect your Sui wallet or enter owner wallet.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("title", title);
    formData.append("description", description);
    formData.append("owner_wallet", ownerWallet);

    try {
      setLoading(true);
      setMessage("");
      setStatusType("");
      setResult(null);
      setSuiTxDigest("");

      const res = await axios.post(
        "http://127.0.0.1:8000/api/uploads",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        },
      );

      if (res.data.duplicate) {
        setStatusType("duplicate");
        setMessage(res.data.message);
        setResult(res.data.data);
        return;
      }

      setResult(res.data.data);
      setStatusType("success");
      setMessage(res.data.message || "File uploaded successfully.");

      try {
        const digest = await registerOnSui(
          res.data.data.cid,
          res.data.data.file_hash,
        );

        setSuiTxDigest(digest);
        await axios.post(
          `http://127.0.0.1:8000/api/uploads/${res.data.data.cid}/tx`,
          new URLSearchParams({ tx: digest }),
          {
            headers: {
              "Content-Type": "application/x-www-form-urlencoded",
            },
          },
        );
      } catch (err: any) {
        console.error("Sui registration failed:", err);
        setStatusType("error");
        setMessage(err?.message || "Sui registration failed.");
      }
    } catch (error: any) {
      console.error("Upload error:", error);
      setStatusType("error");
      setMessage(error?.response?.data?.detail || "Upload failed.");
      setResult(null);
      setSuiTxDigest("");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen max-w-3xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-2">TrustVault</h1>

      <div className="mb-6">
        <ConnectButton />
      </div>

      <p className="mb-8 text-gray-600">
        Upload your work to Pinata/IPFS and get transparent proof of ownership.
      </p>

      <div className="border rounded-2xl p-6 space-y-4 shadow-sm">
        <input
          type="text"
          placeholder="Title"
          className="w-full border rounded-lg p-3"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <textarea
          placeholder="Description"
          className="w-full border rounded-lg p-3"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        <input
          type="text"
          placeholder="Owner wallet"
          className="w-full border rounded-lg p-3"
          value={ownerWallet}
          onChange={(e) => setOwnerWallet(e.target.value)}
        />

        <input
          type="file"
          className="w-full border rounded-lg p-3"
          onChange={(e) => {
            const selectedFile = e.target.files?.[0] || null;
            setFile(selectedFile);
            setSelectedFileName(selectedFile ? selectedFile.name : "");
          }}
        />

        {selectedFileName && (
          <p className="text-sm text-gray-600">Selected: {selectedFileName}</p>
        )}

        <button
          type="button"
          onClick={handleUpload}
          disabled={loading}
          className="px-5 py-3 rounded-lg border font-medium"
        >
          {loading ? "Uploading..." : "Upload File"}
        </button>
      </div>

      {message && (
        <div
          className={`mt-6 p-4 rounded-xl border ${
            statusType === "success"
              ? "bg-green-50 text-green-800"
              : statusType === "duplicate"
                ? "bg-yellow-50 text-yellow-800"
                : "bg-red-50 text-red-800"
          }`}
        >
          <p className="font-medium">{message}</p>

          {statusType === "duplicate" && result?.cid && (
            <a
              href={`/verify/${result.cid}`}
              className="block mt-3 underline font-medium"
            >
              View Existing Proof
            </a>
          )}
        </div>
      )}

      {result && statusType === "success" && (
        <div className="mt-8 border rounded-2xl p-6 space-y-3 shadow-sm">
          <h2 className="text-2xl font-semibold">Upload Successful</h2>

          <p>
            <strong>Title:</strong> {result.title}
          </p>
          <p>
            <strong>CID:</strong> {result.cid}
          </p>
          <p>
            <strong>Owner Wallet:</strong> {result.owner_wallet}
          </p>
          <p>
            <strong>Filename:</strong> {result.original_filename}
          </p>
          <p>
            <strong>Uploaded At:</strong> {result.uploaded_at}
          </p>

          {suiTxDigest && (
            <p>
              <strong>Sui TX Digest:</strong> {suiTxDigest}
            </p>
          )}

          <a
            href={result.gateway_url}
            target="_blank"
            rel="noreferrer"
            className="block underline"
          >
            Open File on IPFS
          </a>

          <a href={`/verify/${result.cid}`} className="block underline">
            Open Verification Page
          </a>
        </div>
      )}
    </main>
  );
}
