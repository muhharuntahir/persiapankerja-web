"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabaseClient";

export default function RegisterPage() {
  const supabase = createClient();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const onRegister = async () => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      alert(error.message);
      return;
    }

    window.location.href = "/auth/login";
  };

  return (
    <div className="max-w-md mx-auto p-4">
      <h1 className="text-xl font-bold mb-4">Register</h1>

      <input
        type="email"
        placeholder="Email"
        className="border p-2 w-full mb-2"
        onChange={(e) => setEmail(e.target.value)}
      />

      <input
        type="password"
        placeholder="Password"
        className="border p-2 w-full mb-2"
        onChange={(e) => setPassword(e.target.value)}
      />

      <button
        className="bg-green-600 text-white px-4 py-2"
        onClick={onRegister}
      >
        Register
      </button>
    </div>
  );
}
