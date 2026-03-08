"use client";

import { useState } from "react";

export default function CopyCidButton({ cid }: { cid: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(cid);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Copy failed:", error);
    }
  };

  return (
    <button
      onClick={handleCopy}
      className="ml-3 px-3 py-1 border rounded-lg text-sm hover:bg-gray-100"
      type="button"
    >
      {copied ? "Copied!" : "Copy CID"}
    </button>
  );
}
