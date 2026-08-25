"use client";
import { PawPrint } from "@phosphor-icons/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import { SESSION_KEY } from "@/Data/store";
import { forgotPassword, login, register, resetPassword } from "@/shared/api/auth";
import { ApiError, AUTH_TOKEN_KEY } from "@/shared/api/client";
import styles from "./Authentication.module.css";

export function AuthForm({ mode }: { mode: "login" | "register" | "forgot" }) {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [error, setError] = useState(""), [submitting, setSubmitting] = useState(false), [resetToken, setResetToken] = useState("");
  useEffect(() => { if (new URLSearchParams(window.location.search).has("expired")) setMessage("Your session expired. Please sign in again."); }, []);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); const data = new FormData(event.currentTarget); setMessage(""); setError(""); setSubmitting(true);
    try {
      if (mode === "forgot") {
        if (resetToken) {
          const password = String(data.get("password"));
          if (password !== String(data.get("confirmPassword"))) throw new Error("Passwords do not match.");
          await resetPassword(resetToken, password); setResetToken(""); setMessage("Password changed successfully. You can now sign in.");
        } else {
          const result = await forgotPassword(String(data.get("email"))); setMessage(result.message);
          if (result.resetToken) setResetToken(result.resetToken);
        }
        return;
      }
      const email = String(data.get("email")), password = String(data.get("password"));
      const result = mode === "login" ? await login(email, password) : await register(String(data.get("name")), email, password);
      localStorage.setItem(SESSION_KEY, JSON.stringify(result.user)); localStorage.setItem(AUTH_TOKEN_KEY, result.token); router.push("/dashboard");
    } catch (caught) {
      if (caught instanceof ApiError && caught.status === 401) setError("The email or password is incorrect.");
      else if (caught instanceof ApiError) setError(caught.message);
      else setError(caught instanceof Error ? caught.message : "We couldn’t reach PawCare. Please try again.");
    } finally { setSubmitting(false); }
  }
  const title = mode === "login" ? "Sign in to your account" : mode === "register" ? "Create your account" : resetToken ? "Choose a new password" : "Reset your password";
  const kicker = mode === "login" ? "Welcome back" : mode === "register" ? "Join PawCare" : "Account recovery";
  const intro = mode === "login" ? "Sign in with your PawCare account." : mode === "register" ? "Create a pet-owner account to keep care organised." : resetToken ? "Use a strong password you haven’t used before." : "Enter your email to begin account recovery.";
  return <main className={styles.page}><section className={styles.card}>
    <Link href="/" className={styles.brand}><span><PawPrint weight="fill" /></span>Paw<strong>Care</strong></Link>
    <p className={styles.kicker}>{kicker}</p><h1>{title}</h1><p className={styles.intro}>{intro}</p>
    <form method="post" onSubmit={submit}>
      {mode === "register" && <label>Full name<input name="name" required placeholder="Your full name" autoComplete="name" /></label>}
      {!(mode === "forgot" && resetToken) && <label>Email address<input name="email" type="email" required placeholder="you@example.com" autoComplete="email" /></label>}
      {mode !== "forgot" && <label>Password<input name="password" type="password" required minLength={8} autoComplete={mode === "login" ? "current-password" : "new-password"} /></label>}
      {mode === "forgot" && resetToken && <><label>New password<input name="password" type="password" required minLength={8} autoComplete="new-password" /></label><label>Confirm new password<input name="confirmPassword" type="password" required minLength={8} autoComplete="new-password" /></label></>}
      <button type="submit" disabled={submitting}>{submitting ? "Please wait…" : mode === "login" ? "Sign in" : mode === "register" ? "Create account" : resetToken ? "Set new password" : "Continue"}</button>
    </form>
    {message && <p className={styles.success}>{message}</p>}{error && <p className={styles.error}>{error}</p>}
    <div className={styles.links}>{mode === "login" ? <><Link href="/forgot-password">Forgot password?</Link><Link href="/register">Create account</Link></> : <Link href="/login">Back to sign in</Link>}</div>
  </section></main>;
}
