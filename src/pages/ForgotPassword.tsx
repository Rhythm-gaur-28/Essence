import React, { useState } from "react";
import toast from "react-hot-toast";
import { API_BASE } from "@/config";

const ForgotPassword = () => {

  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const [otpSent, setOtpSent] = useState(false);

  // ================= SEND OTP =================

  const sendOtp = async () => {

    try {

      const res = await fetch(
        `${API_BASE}/api/auth/forgot-password`,
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

        toast.success("OTP sent successfully");

        setOtpSent(true);

      } else {

        const data = await res.json();

        toast.error(
          data.msg || "Failed to send OTP"
        );
      }

    } catch (err) {

      console.error(err);

      toast.error("Something went wrong");
    }
  };

  // ================= RESET PASSWORD =================

  const resetPassword = async () => {

    try {

      const res = await fetch(
        `${API_BASE}/api/auth/reset-password`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            email,
            otp,
            newPassword
          })
        }
      );

      if (res.ok) {

        toast.success(
          "Password reset successful"
        );

        setEmail("");
        setOtp("");
        setNewPassword("");

      } else {

        const data = await res.json();

        toast.error(
          data.msg || "Failed to reset password"
        );
      }

    } catch (err) {

      console.error(err);

      toast.error("Something went wrong");
    }
  };

  return (

    <div className="min-h-[70vh] flex items-center justify-center px-4">

      <div className="bg-card rounded-xl p-8 border border-border w-full max-w-md shadow-sm animate-fade-in">

        <div className="text-center mb-6">

          <h1 className="font-heading text-2xl font-bold">
            Forgot Password
          </h1>

          <p className="text-sm text-muted-foreground mt-1">
            Reset your account password
          </p>

        </div>

        <div className="space-y-4">

          {/* EMAIL */}

          <div>

            <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-1 block">
              Email
            </label>

            <input
              type="email"
              value={email}
              onChange={(e) =>
                setEmail(e.target.value)
              }
              placeholder="Enter your email"
              className="w-full bg-muted rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/30"
            />

          </div>

          {/* SEND OTP */}

          {!otpSent ? (

            <button
              onClick={sendOtp}
              className="btn-gold w-full text-sm"
            >
              Send OTP
            </button>

          ) : (

            <>
              {/* OTP */}

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
                  placeholder="Enter OTP"
                  maxLength={6}
                  className="w-full bg-muted rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/30 text-center tracking-[6px]"
                />

              </div>

              {/* NEW PASSWORD */}

              <div>

                <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-1 block">
                  New Password
                </label>

                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) =>
                    setNewPassword(e.target.value)
                  }
                  placeholder="Enter new password"
                  className="w-full bg-muted rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/30"
                />

              </div>

              {/* RESET BUTTON */}

              <button
                onClick={resetPassword}
                className="btn-gold w-full text-sm"
              >
                Reset Password
              </button>

            </>
          )}

        </div>

      </div>

    </div>
  );
};

export default ForgotPassword;