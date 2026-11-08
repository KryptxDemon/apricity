import React, { useState } from "react";
import { Heart, Send, X, Bell, Check } from "lucide-react";
import { useMeanwhile } from "../../context/MeanwhileContext";

interface PokeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PRESET_MESSAGES = [
  "Ready for our next study block?",
  "How is your current chapter going?",
  "Taking a quick coffee or tea break?",
  "Just crossed off a task, keep it up!",
  "Waiting for you in the study room.",
  "Almost done with today's goal, let's finish strong.",
];

export const PokeModal: React.FC<PokeModalProps> = ({ isOpen, onClose }) => {
  const { currentUser, collaborators, sendPoke, myUnreadPokes, markPokeAsRead, theme } =
    useMeanwhile();

  const isDark = theme === "dark";
  const otherCollaborators = collaborators.filter((c) => c.id !== currentUser?.id);

  const [selectedRecipientId, setSelectedRecipientId] = useState<string>(
    otherCollaborators[0]?.id || "",
  );
  const [selectedMessage, setSelectedMessage] = useState(PRESET_MESSAGES[0]);
  const [customMessage, setCustomMessage] = useState("");
  const [isCustom, setIsCustom] = useState(false);

  React.useEffect(() => {
    if (!selectedRecipientId && otherCollaborators.length > 0) {
      setSelectedRecipientId(otherCollaborators[0].id);
    }
  }, [otherCollaborators, selectedRecipientId]);

  if (!isOpen) return null;

  const handleSend = () => {
    const msg = isCustom ? customMessage.trim() : selectedMessage;
    if (!msg || !selectedRecipientId) return;
    sendPoke(selectedRecipientId, msg);
    setCustomMessage("");
    setIsCustom(false);
    onClose();
  };

  const targetCompanion = otherCollaborators.find((c) => c.id === selectedRecipientId);

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={`w-full max-w-md rounded-3xl p-6 sm:p-7 shadow-2xl border flex flex-col gap-5 ${
          isDark
            ? "bg-[#1E1B18] border-stone-800 text-white"
            : "bg-[#F7F5EE] border-black/20 text-black"
        }`}
      >
        <div className="flex items-center justify-between border-b border-black/10 dark:border-white/10 pb-3">
          <div className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-rose-500 fill-rose-500/20" />
            <h3 className="font-serif text-2xl font-bold tracking-tight text-black dark:text-white">
              Send a Nudge
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-xl text-black/60 dark:text-white/60 hover:text-black dark:hover:text-white cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Received Unread Pokes */}
        {myUnreadPokes.length > 0 && (
          <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/25 flex flex-col gap-2">
            <div className="flex items-center justify-between text-xs font-bold text-rose-700 dark:text-rose-400">
              <span className="flex items-center gap-1.5">
                <Bell className="w-4 h-4" />
                From {myUnreadPokes[0].senderName}:
              </span>
              <span className="text-[10px] opacity-70">
                {new Date(myUnreadPokes[0].createdAt).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>
            <p className="font-sans text-sm font-semibold text-black dark:text-white">
              "{myUnreadPokes[0].message}"
            </p>
            <button
              onClick={() => markPokeAsRead(myUnreadPokes[0].id)}
              className="mt-1 self-end text-xs font-bold text-[#38513C] dark:text-[#7FA382] hover:underline flex items-center gap-1 cursor-pointer"
            >
              <Check className="w-3.5 h-3.5" /> Acknowledge
            </button>
          </div>
        )}

        {/* Select companion if more than one */}
        {otherCollaborators.length > 1 && (
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-black/70 dark:text-white/70">Send to:</label>
            <div className="flex gap-2 flex-wrap">
              {otherCollaborators.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setSelectedRecipientId(c.id)}
                  className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                    selectedRecipientId === c.id
                      ? "bg-[#38513C] dark:bg-[#7FA382] text-white dark:text-black border-transparent shadow-xs"
                      : "bg-white dark:bg-stone-800 border-black/15 dark:border-stone-700 text-black dark:text-white"
                  }`}
                >
                  {c.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {otherCollaborators.length === 0 ? (
          <div className="p-4 rounded-2xl border border-dashed border-black/20 dark:border-white/20 text-center text-xs font-medium text-black/70 dark:text-white/70">
            You don't have any collaborators yet. Use the <strong>+ Add someone</strong> button on
            the home page to invite friends!
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold text-black/70 dark:text-white/70">
              Message for {targetCompanion?.name || "your partner"}:
            </label>

            <div className="flex flex-col gap-1.5 font-sans">
              {PRESET_MESSAGES.map((msg, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setSelectedMessage(msg);
                    setIsCustom(false);
                  }}
                  className={`p-3 rounded-xl text-left text-xs font-medium transition-all cursor-pointer border font-sans ${
                    !isCustom && selectedMessage === msg
                      ? "bg-[#38513C] dark:bg-[#7FA382] text-white dark:text-black border-transparent shadow-xs font-bold"
                      : isDark
                        ? "bg-stone-900 border-stone-800 hover:bg-stone-800 text-white"
                        : "bg-white border-black/15 hover:bg-stone-100 text-black"
                  }`}
                >
                  "{msg}"
                </button>
              ))}

              <button
                type="button"
                onClick={() => setIsCustom(true)}
                className={`p-3 rounded-xl text-left text-xs font-semibold transition-all cursor-pointer border font-sans ${
                  isCustom
                    ? "bg-[#38513C] dark:bg-[#7FA382] text-white dark:text-black border-transparent"
                    : isDark
                      ? "bg-stone-900 border-stone-800 text-white"
                      : "bg-white border-black/15 text-black"
                }`}
              >
                Custom message...
              </button>

              {isCustom && (
                <textarea
                  rows={2}
                  placeholder="Type your message..."
                  value={customMessage}
                  onChange={(e) => setCustomMessage(e.target.value)}
                  className={`mt-1 p-3 rounded-xl text-xs font-sans border focus:outline-none focus:ring-1 focus:ring-[#38513C] ${
                    isDark
                      ? "bg-stone-900 border-stone-700 text-white"
                      : "bg-white border-black/20 text-black font-medium"
                  }`}
                  autoFocus
                />
              )}
            </div>
          </div>
        )}

        <div className="flex justify-end items-center gap-2 pt-2 border-t border-black/10 dark:border-white/10">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-black/70 dark:text-white/70"
          >
            Cancel
          </button>
          {otherCollaborators.length > 0 && (
            <button
              onClick={handleSend}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#38513C] dark:bg-[#7FA382] hover:opacity-90 text-white dark:text-black text-xs font-bold shadow-xs transition-all cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Send</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
