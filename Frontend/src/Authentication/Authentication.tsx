"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { PawPrint } from "@phosphor-icons/react";
import { demoUsers, SESSION_KEY } from "@/Data/store";
import type { Role } from "@/Data/types";
import styles from "./Authentication.module.css";

export function AuthForm({ mode }: { mode: "login" | "register" | "forgot" }) {
  const router = useRouter(); const [message, setMessage] = useState("");
  function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault(); const data = new FormData(e.currentTarget);
    if (mode === "forgot") { setMessage("A password-reset link has been prepared for your email."); return; }
    const role = (data.get("role") || "owner") as Role;
    const user = mode === "login" ? demoUsers.find((item) => item.role === role)! : { id: crypto.randomUUID(), name: String(data.get("name")), email: String(data.get("email")), role, status: "Active" as const };
    localStorage.setItem(SESSION_KEY, JSON.stringify(user)); router.push("/dashboard");
  }
  return <main className={styles.page}><section className={styles.card}>
    <Link href="/" className={styles.brand}><span><PawPrint weight="fill" /></span>Paw<strong>Care</strong></Link>
    <p className={styles.kicker}>{mode === "login" ? "Welcome back" : mode === "register" ? "Join PawCare" : "Account recovery"}</p>
    <h1>{mode === "login" ? "Sign in to your account" : mode === "register" ? "Create your account" : "Reset your password"}</h1>
    <p className={styles.intro}>{mode === "login" ? "Choose a demo role to explore its complete workspace." : mode === "register" ? "Create a pet-owner account to keep care organised." : "Enter your email and we’ll send recovery instructions."}</p>
    <form onSubmit={submit}>
      {mode === "register" && <label>Full name<input name="name" required placeholder="Your full name" /></label>}
      <label>Email address<input name="email" type="email" required defaultValue={mode === "login" ? "owner@pawcare.test" : ""} placeholder="you@example.com" /></label>
      {mode !== "forgot" && <><label>Password<input name="password" type="password" required defaultValue={mode === "login" ? "demo1234" : ""} minLength={8} /></label><label>Account role<select name="role" defaultValue="owner"><option value="owner">Pet owner</option>{mode === "login" && <><option value="vet">Veterinarian</option><option value="admin">Administrator</option></>}</select></label></>}
      <button type="submit">{mode === "login" ? "Sign in" : mode === "register" ? "Create account" : "Send reset link"}</button>
    </form>{message && <p className={styles.success}>{message}</p>}
    <div className={styles.links}>{mode === "login" ? <><Link href="/forgot-password">Forgot password?</Link><Link href="/register">Create account</Link></> : <Link href="/login">Back to sign in</Link>}</div>
  </section></main>;
}
