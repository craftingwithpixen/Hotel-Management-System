import { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

const extractTableId = (value) => {
  const input = String(value || "").trim();
  if (!input) return "";

  // Accept full QR URL like: /scan/table/<tableId>
  const match = input.match(/\/scan\/table\/([^/?#]+)/i);
  if (match?.[1]) return match[1];

  // Accept plain table id
  return input;
};

export default function ScanQr() {
  const navigate = useNavigate();
  const [qrValue, setQrValue] = useState("");

  const handleOpen = () => {
    const tableId = extractTableId(qrValue);
    if (!tableId) {
      toast.error("Paste QR link or table ID");
      return;
    }
    navigate(`/scan/table/${tableId}`);
  };

  return (
    <div className="animate-fade" style={{ maxWidth: 720, margin: "0 auto" }}>
      <div className="card">
        <h1 className="font-display text-3xl mb-sm">Scan QR</h1>
        <p className="text-muted mb-lg">
          Scan the table QR with your phone camera, then paste the QR link here.
        </p>

        <div className="input-group mb-md">
          <label>QR Link or Table ID</label>
          <input
            className="input"
            placeholder="https://.../scan/table/<tableId> or <tableId>"
            value={qrValue}
            onChange={(e) => setQrValue(e.target.value)}
          />
        </div>

        <div className="flex gap-md">
          <button className="btn btn-outline" onClick={() => navigate("/customer")}>
            Cancel
          </button>
          <button className="btn btn-primary" onClick={handleOpen}>
            Open Table Menu
          </button>
        </div>
      </div>
    </div>
  );
}
