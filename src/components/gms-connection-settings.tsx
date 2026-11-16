"use client";

import { useState, useEffect } from "react";

/**
 * GMS Connection Settings Component
 * =================================
 *
 * Shows the GMS integration status in the TMS tourism admin dashboard.
 * Fetches status from /api/gms-status (server-side) because process.env
 * is NOT available in the browser.
 */

interface GmsStatus {
  configured: boolean;
  apiUrl: string;
  apiKeyPrefix: string;
  connected: boolean;
  integrationName?: string;
  scopes?: string[];
  error?: string;
}

export function GmsConnectionSettings() {
  const [status, setStatus] = useState<GmsStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [testing, setTesting] = useState(false);

  const fetchStatus = async () => {
    setTesting(true);
    try {
      const res = await fetch("/api/gms-status", { cache: "no-store" });
      const data = await res.json();
      setStatus(data);
    } catch (err) {
      setStatus({
        configured: false,
        apiUrl: "",
        apiKeyPrefix: "",
        connected: false,
        error: "Failed to check status",
      });
    } finally {
      setLoading(false);
      setTesting(false);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  if (loading) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 animate-pulse rounded-xl bg-slate-100" />
          <div className="space-y-1">
            <div className="h-4 w-32 animate-pulse rounded bg-slate-100" />
            <div className="h-3 w-48 animate-pulse rounded bg-slate-100" />
          </div>
        </div>
      </div>
    );
  }

  const connected = status?.connected;
  const configured = status?.configured;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-4 flex items-center gap-3">
        <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${
          connected ? "bg-emerald-100" : configured ? "bg-amber-100" : "bg-slate-100"
        }`}>
          {connected ? "✅" : configured ? "⚠️" : "🔌"}
        </div>
        <div>
          <h3 className="text-base font-bold text-slate-900">GMS Integration</h3>
          <p className="text-xs text-slate-500">
            Accommodation Management System — data source for hotels & rooms
          </p>
        </div>
      </div>

      {/* Status badge */}
      <div className="mb-4">
        {connected ? (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-700">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            Connected
          </span>
        ) : configured ? (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-red-100 px-3 py-1 text-xs font-bold text-red-700">
            <span className="h-2 w-2 rounded-full bg-red-500" />
            Configured — connection failed
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">
            <span className="h-2 w-2 rounded-full bg-slate-400" />
            Not configured
          </span>
        )}
      </div>

      {/* Configuration details */}
      {configured && (
        <div className="space-y-2 rounded-xl bg-slate-50 p-3">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-500">GMS API URL:</span>
            <code className="rounded bg-white px-2 py-0.5 font-mono text-slate-700 break-all">
              {status?.apiUrl}
            </code>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-500">API Key:</span>
            <code className="rounded bg-white px-2 py-0.5 font-mono text-slate-700">
              {status?.apiKeyPrefix}
            </code>
          </div>
          {status?.integrationName && (
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500">Integration:</span>
              <span className="font-medium text-slate-700">{status.integrationName}</span>
            </div>
          )}
          {status?.scopes && status.scopes.length > 0 && (
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500">Authorized data:</span>
              <span className="font-medium text-slate-700">{status.scopes.join(", ")}</span>
            </div>
          )}
        </div>
      )}

      {/* Error message */}
      {status?.error && (
        <div className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700 border border-red-200">
          <strong>Error:</strong> {status.error}
        </div>
      )}

      {/* Setup instructions if not configured */}
      {!configured && (
        <div className="mt-3 rounded-lg bg-sky-50 px-3 py-2 text-xs text-sky-800 border border-sky-200">
          <p className="font-semibold mb-1">Setup instructions:</p>
          <ol className="list-decimal ml-4 space-y-0.5">
            <li>Log into the GMS admin dashboard</li>
            <li>Go to System Configuration → External API</li>
            <li>Register this TMS as a new integration</li>
            <li>Copy the generated API key</li>
            <li>Set these env vars in Vercel (TMS project settings):
              <pre className="mt-1 rounded bg-white p-2 font-mono text-[10px]">
GMS_API_URL=https://guesthousewithpolicemodule-ghjo-k4f2dpooj.vercel.app{"\n"}
GMS_API_KEY=ghms_live_xxxxxxxxxxxxxxxx
              </pre>
            </li>
            <li>Redeploy the TMS</li>
          </ol>
        </div>
      )}

      {/* Test button */}
      <button
        onClick={fetchStatus}
        disabled={testing}
        className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-sky-600 px-4 py-2 text-xs font-semibold text-white hover:bg-sky-700 disabled:opacity-50"
      >
        {testing ? "Testing..." : "Test Connection"}
      </button>
    </div>
  );
}
