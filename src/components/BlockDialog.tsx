"use client";

import { useState, type FormEvent } from "react";
import { Modal } from "./Modal";

interface BlockDialogProps {
  taskTitle: string;
  loading?: boolean;
  onConfirm: (reason: string) => void;
  onClose: () => void;
}

export function BlockDialog({
  taskTitle,
  loading,
  onConfirm,
  onClose,
}: BlockDialogProps) {
  const [reason, setReason] = useState("");

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    onConfirm(reason.trim());
  }

  return (
    <Modal title="Registrar impedimento" onClose={onClose}>
      <form className="form" onSubmit={handleSubmit}>
        <p className="muted">
          Tarefa: <strong>{taskTitle}</strong>
        </p>
        <label className="field">
          <span>O que está impedindo a execução?</span>
          <textarea
            required
            rows={4}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Ex.: aguardando retorno do fornecedor"
          />
        </label>
        <div className="form-actions">
          <button type="button" className="btn btn-ghost" onClick={onClose}>
            Cancelar
          </button>
          <button className="btn btn-danger" disabled={loading || !reason.trim()}>
            {loading ? "Salvando..." : "Marcar como bloqueada"}
          </button>
        </div>
      </form>
    </Modal>
  );
}