"use client";

import { useState, type FormEvent } from "react";
import { Lock, LogIn, User } from "lucide-react";
import { saveAuthSession, type AuthUser } from "@/lib/auth";
import { apiFetch, apiUrl } from "@/lib/api";
import type { Locale } from "@/lib/board";

interface LoginFormProps {
  locale: Locale;
  onLoginSuccess: (user: AuthUser) => void;
  onLocaleChange: (locale: Locale) => void;
}

const copy = {
  en: {
    title: "Sign in to LOOM",
    subtitle: "Enter your credentials to access your project board.",
    username: "Username",
    usernamePlaceholder: "Enter user",
    password: "Password",
    passwordPlaceholder: "Enter password",
    submit: "Sign In",
    hintTitle: "Demo Credentials:",
    hintText: "Username: user / Password: password",
    errorInvalid: "Invalid username or password. Please use 'user' and 'password'.",
    switchLanguage: "Switch language",
  },
  fa: {
    title: "ورود به سامانه مدیریت پروژه",
    subtitle: "برای دسترسی به تخته کانبان پروژه، اطلاعات کاربری خود را وارد کنید.",
    username: "نام کاربری",
    usernamePlaceholder: "نام کاربری را وارد کنید",
    password: "رمز عبور",
    passwordPlaceholder: "رمز عبور را وارد کنید",
    submit: "ورود به حساب",
    hintTitle: "اطلاعات ورود آزمایشی:",
    hintText: "نام کاربری: user / رمز عبور: password",
    errorInvalid: "نام کاربری یا رمز عبور نامعتبر است. از user و password استفاده کنید.",
    switchLanguage: "تغییر زبان",
  },
};

export function LoginForm({ locale, onLoginSuccess, onLocaleChange }: LoginFormProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const t = copy[locale];

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage(null);
    setIsSubmitting(true);

    try {
      const response = await apiFetch(apiUrl("/api/auth/login"), {
        method: "POST",
        body: JSON.stringify({ username, password }),
      });
      const result = (await response.json()) as {
        token?: string;
        user?: AuthUser;
      };
      if (!response.ok || !result.token || !result.user) {
        throw new Error("invalid_credentials");
      }

      saveAuthSession(result.token, result.user);
      onLoginSuccess(result.user);
    } catch (error) {
      console.error("Login request failed", error);
      setErrorMessage(t.errorInvalid);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="login-wrapper" dir={locale === "fa" ? "rtl" : "ltr"}>
      <div className="login-card">
        <div className="login-header">
          <div className="login-brand">
            <img className="login-logo" src="/brand/loom-icon.png" alt="" />
            <span className="login-brand-title">LOOM</span>
          </div>

          <div className="login-lang-switch" role="group" aria-label={t.switchLanguage}>
            <button
              type="button"
              className={locale === "en" ? "is-active" : ""}
              onClick={() => onLocaleChange("en")}
              aria-label="English"
            >
              EN
            </button>
            <button
              type="button"
              className={locale === "fa" ? "is-active" : ""}
              onClick={() => onLocaleChange("fa")}
              aria-label="Persian"
            >
              FA
            </button>
          </div>
        </div>

        <h1 className="login-title">{t.title}</h1>
        <p className="login-subtitle">{t.subtitle}</p>

        {errorMessage ? (
          <div className="login-alert" role="alert">
            {errorMessage}
          </div>
        ) : null}

        <form onSubmit={handleSubmit} className="login-form">
          <div className="login-field">
            <label htmlFor="login-username">{t.username}</label>
            <div className="login-input-wrap">
              <User size={16} className="login-field-icon" aria-hidden="true" />
              <input
                id="login-username"
                type="text"
                autoComplete="username"
                required
                value={username}
                placeholder={t.usernamePlaceholder}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
          </div>

          <div className="login-field">
            <label htmlFor="login-password">{t.password}</label>
            <div className="login-input-wrap">
              <Lock size={16} className="login-field-icon" aria-hidden="true" />
              <input
                id="login-password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                placeholder={t.passwordPlaceholder}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <div className="login-demo-hint">
            <strong>{t.hintTitle}</strong>
            <span>{t.hintText}</span>
          </div>

          <button type="submit" className="login-submit-btn" disabled={isSubmitting}>
            <LogIn size={16} aria-hidden="true" />
            <span>{t.submit}</span>
          </button>
        </form>
      </div>
    </div>
  );
}
