import { useState } from "react";
import { Lock, LogOut, RefreshCw, Download } from "lucide-react";
import * as XLSX from "xlsx";

interface Registration {
  id: string;
  name: string;
  mobile: string;
  email: string;
  school: string;
  class: string;
  preference_1: string;
  preference_2: string;
  preference_3: string;
  experience: string | null;
  razorpay_payment_id: string | null;
  amount_paid: number;
  paid_at: string;
  created_at: string;
}

const Admin = () => {
  const [authenticated, setAuthenticated] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [storedCreds, setStoredCreds] = useState({ username: "", password: "" });
  const [error, setError] = useState("");
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);
    const submittedUsername = String(formData.get("username") ?? "").trim();
    const submittedPassword = String(formData.get("password") ?? "");

    setLoading(true);
    const success = await fetchRegistrations(submittedUsername, submittedPassword);
    if (success) {
      setStoredCreds({ username: submittedUsername, password: submittedPassword });
      setAuthenticated(true);
      setError("");
    } else {
      setError("Invalid credentials");
    }
    setLoading(false);
  };

  const fetchRegistrations = async (user?: string, pass?: string): Promise<boolean> => {
    const u = user || storedCreds.username;
    const p = pass || storedCreds.password;
    if (!u || !p) return false;

    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/get-registrations`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
          },
          body: JSON.stringify({ username: u, password: p }),
        }
      );

      const result = await response.json();

      if (!response.ok || result?.success === false) {
        setRegistrations([]);
        return false;
      }

      setRegistrations((result?.data as Registration[]) ?? []);
      return true;
    } catch (err) {
      console.error("Failed to fetch registrations:", err);
      setRegistrations([]);
      return false;
    }
  };

  const handleRefresh = async () => {
    setLoading(true);
    await fetchRegistrations();
    setLoading(false);
  };

  const handleDownload = () => {
    if (registrations.length === 0) return;
    const data = registrations.map((r, i) => ({
      "#": i + 1,
      Name: r.name,
      Mobile: r.mobile,
      Email: r.email,
      School: r.school,
      Class: r.class,
      "Preference 1": r.preference_1,
      "Preference 2": r.preference_2,
      "Preference 3": r.preference_3,
      Experience: r.experience || "",
      "Payment ID": r.razorpay_payment_id || "",
      "Paid At": new Date(r.paid_at).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "medium" }),
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Registrations");
    XLSX.writeFile(wb, `registrations_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  if (!authenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <form
          onSubmit={handleLogin}
          className="w-full max-w-sm bg-card border border-border rounded-2xl p-8 space-y-4"
        >
          <div className="flex items-center gap-2 mb-2">
            <Lock size={20} className="text-primary" />
            <h1 className="text-xl font-display font-bold text-foreground">Admin Login</h1>
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <input
            type="text"
            name="username"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full px-4 py-3 rounded-xl bg-background border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-3 rounded-xl bg-background border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
          />
          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:opacity-90 transition"
          >
            Login
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-display font-bold text-foreground">
          Registrations ({registrations.length})
        </h1>
        <div className="flex gap-2">
          <button
            onClick={handleRefresh}
            className="px-4 py-2 rounded-xl bg-card border border-border text-foreground text-sm flex items-center gap-2 hover:bg-muted transition"
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} /> Refresh
          </button>
          <button
            onClick={() => setAuthenticated(false)}
            className="px-4 py-2 rounded-xl bg-card border border-border text-foreground text-sm flex items-center gap-2 hover:bg-muted transition"
          >
            <LogOut size={14} /> Logout
          </button>
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border border-border">
        <table className="w-full text-sm text-foreground">
          <thead className="bg-card border-b border-border">
            <tr>
              {["#", "Name", "Mobile", "Email", "School", "Class", "Pref 1", "Pref 2", "Pref 3", "Experience", "Payment ID", "Paid At"].map((h) => (
                <th key={h} className="px-4 py-3 text-left text-xs font-heading uppercase tracking-wider text-muted-foreground whitespace-nowrap">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {registrations.map((r, i) => (
              <tr key={r.id} className="border-b border-border/50 hover:bg-card/50 transition">
                <td className="px-4 py-3 text-muted-foreground">{i + 1}</td>
                <td className="px-4 py-3 whitespace-nowrap">{r.name}</td>
                <td className="px-4 py-3 whitespace-nowrap">{r.mobile}</td>
                <td className="px-4 py-3 whitespace-nowrap">{r.email}</td>
                <td className="px-4 py-3 whitespace-nowrap">{r.school}</td>
                <td className="px-4 py-3">{r.class}</td>
                <td className="px-4 py-3 whitespace-nowrap">{r.preference_1}</td>
                <td className="px-4 py-3 whitespace-nowrap">{r.preference_2}</td>
                <td className="px-4 py-3 whitespace-nowrap">{r.preference_3}</td>
                <td className="px-4 py-3 max-w-[200px] truncate">{r.experience || "—"}</td>
                <td className="px-4 py-3 whitespace-nowrap font-mono text-xs">{r.razorpay_payment_id || "—"}</td>
                <td className="px-4 py-3 whitespace-nowrap text-xs">
                  {new Date(r.paid_at).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}
                </td>
              </tr>
            ))}
            {registrations.length === 0 && (
              <tr>
                <td colSpan={12} className="px-4 py-8 text-center text-muted-foreground">
                  No registrations yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Admin;
