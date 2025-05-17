"use client";

import React from "react";

type UpdateApprovalUIProps = {
  onApprove: () => void;
  onReject: () => void;
};

export default function UpdateApprovalUI({ onApprove, onReject }: UpdateApprovalUIProps) {
  return (
    <div style={{ padding: "1rem", border: "1px solid #ccc", borderRadius: 8, backgroundColor: "#f9f9f9" }}>
      <p>振り返り内容をAIで解析し、教育観モデルへの反映を承認しますか？</p>
      <button onClick={onApprove} style={{ marginRight: "1rem" }}>はい</button>
      <button onClick={onReject}>いいえ</button>
    </div>
  );
}
