'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const login = async () => {
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: email,
          password: password,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.error || "Invalid credentials");
        setLoading(false);
        return;
      }

      localStorage.setItem("token", data.token);

      if (data.role === "SELLER") {
        router.push("/sellersdashboard");
      } else if (data.role === "BUYER") {
        router.push("/buyers");
      } else {
        router.push("/");
      }

    } catch (err) {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-indigo-700">
      <div className="bg-white p-10 rounded-2xl w-96 shadow-xl">
        <h2 className="text-2xl font-bold mb-6 text-center">
          GiftConnect Login
        </h2>

        {error && (
          <p className="text-red-600 text-sm mb-4 text-center">
            {error}
          </p>
        )}

        <input
          className="w-full border p-3 rounded mb-4"
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
        />

        <input
          type="password"
          className="w-full border p-3 rounded mb-6"
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
        />

        <button
          onClick={login}
          disabled={loading}
          className="bg-indigo-600 text-white w-full py-3 rounded hover:bg-indigo-700"
        >
          {loading ? "Logging in..." : "Login"}
        </button>
      </div>
    </div>
  );
}