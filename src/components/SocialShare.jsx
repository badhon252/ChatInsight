import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Share2, Twitter, Facebook, Linkedin, Link2, Check, Copy } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function SocialShare({ title, description, url }) {
  const [showOptions, setShowOptions] = useState(false);
  const [copied, setCopied] = useState(false);

  const shareUrl = url || window.location.href;
  const shareTitle = title || "Check out my Chat Analysis insights!";
  const shareDescription = description || "I analyzed my chat history and discovered amazing insights about my conversation patterns.";

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const shareToTwitter = () => {
    const text = `${shareTitle} ${shareDescription}`;
    window.open(
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(shareUrl)}`,
      "_blank",
      "width=600,height=400"
    );
  };

  const shareToFacebook = () => {
    window.open(
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
      "_blank",
      "width=600,height=400"
    );
  };

  const shareToLinkedIn = () => {
    window.open(
      `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`,
      "_blank",
      "width=600,height=400"
    );
  };

  const shareButtons = [
    {
      name: "Twitter",
      icon: Twitter,
      color: "bg-[#1DA1F2]",
      action: shareToTwitter
    },
    {
      name: "Facebook",
      icon: Facebook,
      color: "bg-[#4267B2]",
      action: shareToFacebook
    },
    {
      name: "LinkedIn",
      icon: Linkedin,
      color: "bg-[#0077B5]",
      action: shareToLinkedIn
    },
    {
      name: "Copy Link",
      icon: copied ? Check : Copy,
      color: copied ? "bg-[#39FF14]" : "bg-black",
      action: handleCopyLink
    }
  ];

  return (
    <div className="relative">
      <Button
        onClick={() => setShowOptions(!showOptions)}
        className="bg-[#FF006E] hover:bg-[#FF006E]/90 text-white border-3 border-black font-black uppercase px-6 py-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all"
      >
        <Share2 className="w-5 h-5 mr-2" strokeWidth={3} />
        SHARE
      </Button>

      <AnimatePresence>
        {showOptions && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40"
              onClick={() => setShowOptions(false)}
            />

            {/* Share Options */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: -10 }}
              className="absolute top-full mt-3 right-0 bg-white border-4 border-black p-4 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] z-50 min-w-[280px]"
            >
              <h4 className="font-black text-sm uppercase mb-4 pb-3 border-b-3 border-black">
                SHARE YOUR INSIGHTS
              </h4>
              
              <div className="space-y-3">
                {shareButtons.map((button, idx) => (
                  <motion.button
                    key={button.name}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    onClick={button.action}
                    className={`
                      w-full flex items-center gap-3 px-4 py-3 border-3 border-black font-bold
                      ${button.color} text-white
                      shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]
                      hover:shadow-[5px_5px_0px_0px_rgba(0,0,0,1)]
                      hover:translate-x-[-2px] hover:translate-y-[-2px]
                      transition-all
                    `}
                  >
                    <button.icon className="w-5 h-5" strokeWidth={3} />
                    <span className="uppercase text-sm">{button.name}</span>
                  </motion.button>
                ))}
              </div>

              <div className="mt-4 pt-4 border-t-3 border-black">
                <p className="text-xs font-bold text-black/60">
                  🔒 Your data stays private. Only share summary insights.
                </p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}