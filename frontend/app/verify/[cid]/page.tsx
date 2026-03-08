import Link from "next/link";
import CopyCidButton from "../../components/CopyCidButton";
import CopyLinkButton from "../../components/CopyLinkButton";

type UploadResponse = {
  success: boolean;
  data: {
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
  };
};

type OnChainResponse = {
  success: boolean;
  data: {
    verified: boolean;
    registry_id: string;
    note: string;
  };
};

async function getUpload(cid: string): Promise<UploadResponse> {
  const res = await fetch(`http://127.0.0.1:8000/api/uploads/${cid}`, {
    cache: "no-store",
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Failed to fetch upload: ${res.status} ${errorText}`);
  }

  return res.json();
}

async function getOnChainStatus(cid: string): Promise<OnChainResponse | null> {
  try {
    const res = await fetch(`http://127.0.0.1:8000/api/verify-onchain/${cid}`, {
      cache: "no-store",
    });

    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export default async function VerifyPage({
  params,
}: {
  params: Promise<{ cid: string }>;
}) {
  const { cid } = await params;

  const response = await getUpload(cid);
  const onChain = await getOnChainStatus(cid);
  const data = response.data;

  const isImage = data.mime_type?.startsWith("image/");
  const isPdf = data.mime_type === "application/pdf";

  return (
    <main className="min-h-screen max-w-4xl mx-auto p-8">
      <Link
        href="/"
        className="inline-flex items-center mb-6 px-4 py-2 text-sm font-medium border rounded-lg hover:bg-gray-100"
      >
        ← Back to Upload
      </Link>

      <h1 className="text-3xl font-bold mb-6">Verification Page</h1>

      {onChain?.data?.verified ? (
        <div className="mb-6 p-4 rounded-xl border bg-green-50 text-green-800">
          <p className="font-semibold">✓ Verified on Sui</p>
          <p className="text-sm mt-1">{onChain.data.note}</p>
          <p className="text-sm mt-1">
            <strong>Registry:</strong> {onChain.data.registry_id}
          </p>
        </div>
      ) : (
        <div className="mb-6 p-4 rounded-xl border bg-yellow-50 text-yellow-800">
          <p className="font-semibold">⚠ On-chain verification unavailable</p>
        </div>
      )}

      <div className="border rounded-2xl p-6 space-y-4 shadow-sm">
        <p>
          <strong>Title:</strong> {data.title}
        </p>
        <p>
          <strong>Description:</strong> {data.description}
        </p>

        <div className="flex items-center flex-wrap gap-2">
          <p>
            <strong>CID:</strong> {data.cid}
          </p>
          <CopyCidButton cid={data.cid} />
          <CopyLinkButton cid={data.cid} />
        </div>

        <p>
          <strong>Upload Timestamp:</strong> {data.uploaded_at}
        </p>
        <p>
          <strong>Owner Wallet:</strong> {data.owner_wallet}
        </p>
        <p>
          <strong>Filename:</strong> {data.original_filename}
        </p>
        <p>
          <strong>MIME Type:</strong> {data.mime_type}
        </p>
        <p>
          <strong>File Size:</strong> {data.size_bytes} bytes
        </p>
        <p>
          <strong>File Hash:</strong> {data.file_hash}
        </p>
        <p>
          <strong>Blockchain TX:</strong>{" "}
          {data.blockchain_tx || "Not recorded yet"}
        </p>
        <p>
          <strong>Similarity Score:</strong> {data.similarity_score || "N/A"}
        </p>
        <p>
          <strong>Similar To CID:</strong> {data.similar_to_cid || "N/A"}
        </p>

        <a
          href={data.gateway_url}
          target="_blank"
          rel="noreferrer"
          className="block underline"
        >
          View File on IPFS
        </a>
      </div>

      <div className="mt-8 border rounded-2xl p-6 shadow-sm">
        <h2 className="text-2xl font-semibold mb-4">File Preview</h2>

        {isImage && (
          <img
            src={data.gateway_url}
            alt={data.original_filename}
            className="max-w-full rounded-xl border"
          />
        )}

        {isPdf && (
          <iframe
            src={data.gateway_url}
            className="w-full h-[700px] rounded-xl border"
            title="PDF Preview"
          />
        )}

        {!isImage && !isPdf && (
          <p className="text-gray-600">
            Preview is not available for this file type. Use the IPFS link above
            to open it.
          </p>
        )}
      </div>
    </main>
  );
}
