import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import toast from "react-hot-toast";

const VerifyOtp = () => {

  const [otp, setOtp] = useState("");

  const [cooldown, setCooldown] = useState(0);

  const navigate = useNavigate();

  const location = useLocation();

  const { verifyOtp } = useAuth();

  const email = location.state?.email;

  // ================= VERIFY OTP =================

  const handleVerify = async (
    e: React.FormEvent
  ) => {

    e.preventDefault();

    if (!email) {

      toast.error("Missing email");

      return;
    }

    const success = await verifyOtp(
      email,
      otp
    );

    if (success) {

      toast.success(
        "Account created successfully"
      );

      navigate("/login");

    } else {

      toast.error(
        "Invalid or expired OTP"
      );
    }
  };

  // ================= RESEND OTP =================

  const resendOtp = async () => {

    if (cooldown > 0) return;

    try {

      const res = await fetch(
        "http://localhost:5000/api/auth/resend-otp",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            email
          })
        }
      );

      if (res.ok) {

        toast.success("OTP resent");

        setCooldown(30);

        const interval = setInterval(() => {

          setCooldown((prev) => {

            if (prev <= 1) {

              clearInterval(interval);

              return 0;
            }

            return prev - 1;
          });

        }, 1000);

      } else {

        toast.error(
          "Failed to resend OTP"
        );
      }

    } catch (err) {

      console.error(err);

      toast.error(
        "Something went wrong"
      );
    }
  };

  return (

    <div className="min-h-[70vh] flex items-center justify-center px-4">

      <div className="bg-card rounded-xl p-8 border border-border w-full max-w-md shadow-sm animate-fade-in">

        <div className="text-center mb-6">

          <h1 className="font-heading text-2xl font-bold">
            Verify OTP
          </h1>

          <p className="text-sm text-muted-foreground mt-1">
            Enter the OTP sent to your email
          </p>

          <p className="text-xs mt-2 text-primary">
            {email}
          </p>

        </div>

        <form
          onSubmit={handleVerify}
          className="space-y-4"
        >

          {/* OTP INPUT */}

          <div>

            <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-1 block">
              OTP
            </label>

            <input
              type="text"
              value={otp}
              onChange={(e) =>
                setOtp(e.target.value)
              }
              required
              maxLength={6}
              className="w-full bg-muted rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/30 text-center tracking-[8px]"
            />

          </div>

          {/* VERIFY BUTTON */}

          <button
            type="submit"
            className="btn-gold w-full text-sm"
          >
            Verify OTP
          </button>

          {/* RESEND BUTTON */}

          <button
            type="button"
            onClick={resendOtp}
            disabled={cooldown > 0}
            className="w-full border border-border rounded-lg py-2.5 text-sm hover:bg-muted transition"
          >
            {
              cooldown > 0
                ? `Resend OTP in ${cooldown}s`
                : "Resend OTP"
            }
          </button>

        </form>

      </div>

    </div>
  );
};

export default VerifyOtp;