"use client";
import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, CheckCircle, Envelope, Eye, EyeSlash, LockKey, PawPrint, UserCircle, WarningCircle } from "@phosphor-icons/react";
import type { User } from "@/Data/types";
import { SESSION_KEY } from "@/Data/store";
import { ApiError } from "@/shared/api/client";
import { changePassword, getAccount, updateAccount } from "@/shared/api/auth";
import styles from "./AccountPage.module.css";

export function AccountPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null), [notice, setNotice] = useState(""), [error, setError] = useState("");
  const [showPasswords, setShowPasswords] = useState(false), [savingProfile, setSavingProfile] = useState(false), [savingPassword, setSavingPassword] = useState(false);
  useEffect(() => { getAccount().then(setUser).catch(() => router.replace("/login")); }, [router]);
  function clearMessages() { setError(""); setNotice(""); }
  async function saveProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); clearMessages(); setSavingProfile(true); const data = new FormData(event.currentTarget);
    try { const updated = await updateAccount(String(data.get("name")), String(data.get("email"))); setUser(updated); localStorage.setItem(SESSION_KEY, JSON.stringify(updated)); setNotice("Your profile has been updated."); }
    catch (caught) { setError(caught instanceof ApiError ? caught.message : "Couldn’t update your profile."); }
    finally { setSavingProfile(false); }
  }
  async function savePassword(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); clearMessages(); setSavingPassword(true); const form = event.currentTarget, data = new FormData(form);
    if (data.get("newPassword") !== data.get("confirmPassword")) { setError("New passwords do not match."); setSavingPassword(false); return; }
    try { await changePassword(String(data.get("currentPassword")), String(data.get("newPassword"))); form.reset(); setNotice("Your password has been changed securely."); }
    catch (caught) { setError(caught instanceof ApiError ? caught.message : "Couldn’t change your password."); }
    finally { setSavingPassword(false); }
  }
  if (!user) return <main className={styles.loading}><PawPrint weight="duotone" /><p>Loading your account…</p></main>;
  const initials = user.name.split(" ").map((part) => part[0]).slice(0, 2).join("");
  return <main className={styles.page}>
    <header className={styles.topbar}><Link href="/dashboard" className={styles.brand}><span><PawPrint weight="fill" /></span>Paw<strong>Care</strong></Link><Link href="/dashboard" className={styles.back}><ArrowLeft /> Back to dashboard</Link></header>
    <div className={styles.shell}>
      <section className={styles.intro}><div className={styles.avatar}>{initials}</div><div><span>ACCOUNT SETTINGS</span><h1>Your PawCare profile</h1><p>Keep your personal details accurate and your account secure.</p></div></section>
      {(notice || error) && <div className={`${styles.message} ${error ? styles.messageError : ""}`} role="status">{error ? <WarningCircle weight="fill" /> : <CheckCircle weight="fill" />}<span>{error || notice}</span><button onClick={clearMessages} aria-label="Dismiss message">×</button></div>}
      <div className={styles.grid}>
        <section className={styles.card}><header><span><UserCircle weight="duotone" /></span><div><h2>Personal information</h2><p>Used to identify you across PawCare.</p></div></header>
          <form onSubmit={saveProfile}><label>Full name<div className={styles.field}><UserCircle /><input name="name" defaultValue={user.name} required autoComplete="name" /></div></label><label>Email address<div className={styles.field}><Envelope /><input name="email" type="email" defaultValue={user.email} required autoComplete="email" /></div></label><button disabled={savingProfile}>{savingProfile ? "Saving…" : "Save profile"}</button></form>
        </section>
        <section className={styles.card}><header><span><LockKey weight="duotone" /></span><div><h2>Password & security</h2><p>Use at least eight characters.</p></div></header>
          <form onSubmit={savePassword}><PasswordField label="Current password" name="currentPassword" visible={showPasswords} /><PasswordField label="New password" name="newPassword" visible={showPasswords} /><PasswordField label="Confirm new password" name="confirmPassword" visible={showPasswords} /><button type="button" className={styles.visibility} onClick={() => setShowPasswords((value) => !value)}>{showPasswords ? <EyeSlash /> : <Eye />}{showPasswords ? "Hide passwords" : "Show passwords"}</button><button disabled={savingPassword}>{savingPassword ? "Updating…" : "Change password"}</button></form>
        </section>
      </div>
      <p className={styles.securityNote}><LockKey /> Your account data is protected and changes are sent securely to PawCare.</p>
    </div>
  </main>;
}

function PasswordField({ label, name, visible }: { label: string; name: string; visible: boolean }) {
  return <label>{label}<div className={styles.field}><LockKey /><input name={name} type={visible ? "text" : "password"} minLength={8} required autoComplete={name === "currentPassword" ? "current-password" : "new-password"} /></div></label>;
}
