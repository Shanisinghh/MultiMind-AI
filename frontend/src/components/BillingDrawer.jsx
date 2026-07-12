import { AnimatePresence, motion } from "framer-motion";
import { X, Crown, Zap } from "lucide-react";
import { useState } from "react";
import { useEffect } from "react";
import { useSelector } from "react-redux";
import { createOrder } from "../features/billing.api";
import api from "../utils/axios";

export default function BillingDrawer({ open, onClose }) {
  const { userData } = useSelector((state) => state.user);
  const handleUpgrade = async (plan) => {
    try {
      const data = await createOrder(plan);

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY,

        amount: data.order.amount,

        currency: data.order.currency,

        name: "MultiMind AI",

        description: `${data.plan.name} Plan`,

        order_id: data.order.id,

        handler: async (response) => {
          try {
            const { data } = await api.post(
              "/api/billing/verify-payment",

              response,
            );

            console.log(data);
          } catch (error) {
            console.log(error);
          }
        },

        theme: {
          color: "#4F46E5",
        },
      };

      const razorpay = new window.Razorpay(options);

      razorpay.open();
    } catch (error) {
      console.log(error);
    }
  };
  console.log(((userData?.credits || 0) / (userData?.totalCredits || 1)) * 100);
  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.65 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black z-40 backdrop-blur-sm"
          />

          {/* Drawer */}

          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="fixed right-0 top-0 z-50 h-screen w-full max-w-[380px] bg-[#0a0a0d] border-l border-white/[0.08] shadow-2xl flex flex-col font-sans"
          >
            {/* Header */}

            <div className="flex items-center justify-between p-5 border-b border-white/[0.08]">
              <div>
                <h2 className="text-[#ece9e4] text-lg font-semibold tracking-tight">
                  Billing
                </h2>

                <p className="font-mono text-[11px] text-[#55575e] tracking-wide mt-0.5">
                  // plans &amp; credits
                </p>
              </div>

              <button
                onClick={onClose}
                aria-label="Close billing panel"
                className="w-9 h-9 rounded-lg bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.08]
                  hover:border-white/[0.15] active:scale-90 transition-all duration-150 flex items-center justify-center cursor-pointer"
              >
                <X size={17} className="text-[#8b8d94]" />
              </button>
            </div>

            {/* Current Plan */}

            <div className="p-5">
              <div className="rounded-xl bg-white/[0.03] border border-white/[0.08] p-4">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-[#8b8d94] text-[12.5px]">Current Plan</p>

                    <h3 className="text-[#ece9e4] text-xl font-bold mt-0.5">
                      {userData?.plan ?? "Pro"}
                    </h3>
                  </div>

                  <div className="w-9 h-9 rounded-lg bg-[#f2b632]/10 border border-[#f2b632]/25 flex items-center justify-center">
                    <Crown size={16} className="text-[#f2b632]" />
                  </div>
                </div>

                <div className="mt-5">
                  <div className="flex justify-between font-mono text-[11px] text-[#55575e] mb-2">
                    <span>credits</span>

                    <span>
                      {userData?.credits || 0}/{userData?.totalCredits || 0}
                    </span>
                  </div>

                  <div className="h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
                    <div
                      className="h-full bg-[#f2b632] transition-all duration-500 rounded-full"
                      style={{
                        width: `${
                          ((userData?.credits || 0) /
                            (userData?.totalCredits || 1)) *
                          100
                        }%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Plans */}

            <div className="px-5 flex-1 overflow-auto space-y-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {/* Starter */}

              <div className="rounded-xl border border-white/[0.08] p-4 hover:border-white/[0.15] transition-colors duration-150">
                <h3 className="text-[#ece9e4] font-semibold text-[14px]">Starter</h3>

                <p className="text-[#f2b632] text-2xl font-bold mt-2">₹199</p>

                <p className="font-mono text-[11px] text-[#55575e] mt-1">500 credits</p>

                <button
                  className="mt-4 w-full rounded-lg border border-white/[0.1] bg-white/[0.04] hover:bg-white/[0.08]
                    hover:border-white/[0.2] active:scale-[0.98] transition-all duration-150 py-2 text-[13px]
                    font-medium text-[#ece9e4] cursor-pointer"
                  onClick={() => handleUpgrade("starter")}
                >
                  Upgrade
                </button>
              </div>

              {/* Pro */}

              <div className="rounded-xl border border-[#f2b632]/40 bg-[#f2b632]/[0.03] p-4 relative">
                <span className="absolute right-3 top-3 font-mono text-[10px] tracking-wide bg-[#f2b632]/15 text-[#f2b632] border border-[#f2b632]/30 px-2 py-1 rounded-full">
                  popular
                </span>

                <h3 className="text-[#ece9e4] font-semibold text-[14px] flex items-center gap-1.5">
                  Pro
                  <Zap size={14} className="text-[#f2b632]" />
                </h3>

                <p className="text-[#f2b632] text-2xl font-bold mt-2">₹499</p>

                <p className="font-mono text-[11px] text-[#55575e] mt-1">1000 credits</p>

                <button
                  className="mt-4 w-full rounded-lg bg-[#f2b632] hover:brightness-110 active:scale-[0.98]
                    transition-all duration-150 py-2 text-[13px] font-semibold text-[#0a0a0d] cursor-pointer
                    shadow-[0_1px_10px_rgba(242,182,50,0.25)]"
                  onClick={() => handleUpgrade("pro")}
                >
                  Upgrade
                </button>
              </div>
            </div>

            {/* Footer */}

            <div className="p-5 border-t border-white/[0.08]">
              <p className="text-[11.5px] text-[#55575e] leading-relaxed">
                Credits are used for Image, PDF, PPT and AI Generation.
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}