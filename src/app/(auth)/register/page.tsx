"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";

export default function RegisterPage() {
  const { user, loading, register } = useAuth();
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && user) router.replace("/dashboard");
  }, [user, loading, router]);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await register(name, email, password);
      router.replace("/settings");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Falha ao cadastrar.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="form">
      <h2>Criar conta</h2>
      {error && <div className="alert alert-error">{error}</div>}

      <label className="field">
        <span>Nome</span>
        <input
          required
          minLength={2}
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Seu nome"
        />
      </label>

      <label className="field">
        <span>E-mail</span>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="voce@exemplo.com"
        />
      </label>

      <label className="field">
        <span>Senha</span>
        <input
  type="password"
  required
  minLength={8}
  value={password}
  onChange={(e) => setPassword(e.target.value)}
  placeholder="Mínimo de 8 caracteres"
/>
      </label>

      <button className="btn btn-primary btn-block" disabled={submitting}>
        {submitting ? "Criando conta..." : "Criar conta"}
      </button>

      <p className="form-footer">
        Já tem conta? <Link href="/login">Entrar</Link>
      </p>
    </form>
  );
}