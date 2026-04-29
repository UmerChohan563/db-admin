import React from "react";
import { Database, Server, User, Lock, AlertCircle } from "lucide-react";
import { useConnectionStore } from "../stores/connectionStore";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { Select } from "../components/ui/Select";

const DB_TYPES = [
  { value: "postgresql", label: "PostgreSQL" },
  { value: "mysql", label: "MySQL" },
  { value: "sqlite", label: "SQLite" },
  { value: "mssql", label: "SQL Server" },
];

export const ConnectionPage: React.FC = () => {
  const { credentials, isConnecting, connectionError, setCredentials, connect } =
    useConnectionStore();

  const handleConnect = (e: React.FormEvent) => {
    e.preventDefault();
    connect();
  };

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center relative overflow-hidden">
      {/* Background grid */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(#6ee7b7 1px, transparent 1px), linear-gradient(90deg, #6ee7b7 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      {/* Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-accent/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="relative z-10 w-full max-w-md mx-4">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-surface border border-border rounded-2xl mb-4">
            <Database size={24} className="text-accent" />
          </div>
          <h1 className="text-2xl font-semibold text-text font-mono tracking-tight">
            DB<span className="text-accent">Admin</span>
          </h1>
          <p className="text-text-dim text-sm mt-1">Connect to your database</p>
        </div>

        {/* Form card */}
        <div className="bg-surface/80 backdrop-blur border border-border rounded-2xl p-6 shadow-2xl">
          <form onSubmit={handleConnect} className="flex flex-col gap-4">
            <Select
              label="Database Type"
              options={DB_TYPES}
              value={credentials.dbType}
              onChange={(e) => setCredentials({ dbType: e.target.value })}
            />

            <div className="grid grid-cols-3 gap-3">
              <div className="col-span-2">
                <Input
                  label="Host"
                  placeholder="localhost"
                  value={credentials.host}
                  onChange={(e) => setCredentials({ host: e.target.value })}
                  icon={<Server size={14} />}
                />
              </div>
              <Input
                label="Port"
                placeholder="5432"
                value={credentials.port}
                onChange={(e) => setCredentials({ port: e.target.value })}
              />
            </div>

            <Input
              label="Username"
              placeholder="root"
              value={credentials.username}
              onChange={(e) => setCredentials({ username: e.target.value })}
              icon={<User size={14} />}
            />

            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              value={credentials.password}
              onChange={(e) => setCredentials({ password: e.target.value })}
              icon={<Lock size={14} />}
            />

            {connectionError && (
              <div className="flex items-start gap-2 p-3 rounded-lg bg-danger/10 border border-danger/30">
                <AlertCircle size={14} className="text-danger mt-0.5 shrink-0" />
                <p className="text-xs text-danger font-mono leading-relaxed">{connectionError}</p>
              </div>
            )}

            <Button type="submit" size="lg" loading={isConnecting} className="mt-1 w-full">
              {isConnecting ? "Connecting..." : "Connect"}
            </Button>
          </form>

          <div className="mt-4 pt-4 border-t border-border">
            <p className="text-xs text-muted font-mono text-center">
              Demo: host=localhost · user=root · pass=root
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
