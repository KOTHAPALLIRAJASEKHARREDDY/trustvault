"use client";

import { useState } from "react";

export default function CopyLinkButton({ cid }: { cid: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    const url = `${window.location.origin}/verify/${cid}`;
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={handleCopy}
      className="px-3 py-1 border rounded-lg text-sm hover:bg-gray-100"
      type="button"
    >
      {copied ? "Copied!" : "Copy Proof Link"}
    </button>
  );
}
