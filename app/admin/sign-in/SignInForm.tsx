"use client";

import { useState } from "react";

export function SignInForm() {
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleCredentials(formData: FormData) {
    setPending(true);
    setError(null);

    const response = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: String(formData.get("email") ?? ""),
        password: String(formData.get("password") ?? ""),
      }),
    });

    const result = await response.json().catch(() => null) as { success?: boolean; message?: string; redirectTo?: string } | null;

    if (response.ok && result?.success) {
      window.location.href = result.redirectTo ?? "/admin";
      return;
    }

    setError(result?.message ?? "Wrong email or password.");
    setPending(false);
  }

  return <div className="admin-auth-card">
    <div className="admin-auth-shell">
      <div className="admin-auth-copy">
        <p>ADMIN LOGIN</p>
        <h1>Simple local access.</h1>
        <span>DEV MODE</span>
        <small>Use the default admin email and password for local testing.</small>
      </div>
    </div>

    <form action={handleCredentials} className="admin-auth-form">
      <label>
        <span>Email</span>
        <input name="email" type="email" autoComplete="username email" defaultValue="alimohammadi.8773@gmail.com" required />
      </label>
      <label>
        <span>Password</span>
        <div className="admin-password-row">
          <input name="password" type={passwordVisible ? "text" : "password"} autoComplete="current-password" defaultValue="AliAdmin!2026" required />
          <button type="button" onClick={() => setPasswordVisible((value) => !value)} aria-label={passwordVisible ? "Hide password" : "Show password"}>
            {passwordVisible ? "HIDE" : "SHOW"}
          </button>
        </div>
      </label>
      {error && <p className="admin-auth-error" role="status">{error}</p>}
      <button type="submit" disabled={pending}>{pending ? "SIGNING IN..." : "SIGN IN"}</button>
    </form>
  </div>;
}
