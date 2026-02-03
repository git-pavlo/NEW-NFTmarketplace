import { useAccount, useDisconnect } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { motion } from "motion/react";
import { useEffect, useRef } from "react";

export default function WalletConnect() {
  const { isConnected, address } = useAccount();
  const { disconnect } = useDisconnect();

  const shortAddress = (addr) =>
    `${addr.slice(0, 6)}...${addr.slice(-4)}`;

  return (
      <div className="flex items-center gap-4">
        {!isConnected ? (
            <ConnectButton />
        ) : (
          <>
            <div className="px-4 py-2 rounded-lg bg-slate-800/50 border border-purple-500/30 text-sm">
              {shortAddress(address)}
            </div>
            <motion.button
              onClick={() => disconnect()}
              className="button-glow flex-1 py-2 px-4 rounded-2xl bg-gradient-to-r from-[#8a6aff] to-[#38bdf8] text-white radio-shine"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Disconnect
            </motion.button>
          </>
        )}
      </div>

  );
}