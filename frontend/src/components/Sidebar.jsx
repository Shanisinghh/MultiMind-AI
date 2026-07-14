import { useEffect, useState } from "react";
import {
  Plus,
  MessageSquare,
  LogOut,
  User,
  PenSquare,
  Menu,
  X,
  CoinsIcon,
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import api from "../utils/axios";
import { setUserData } from "../redux/user.slice";
import {
  createConversation,
  getConversations,
} from "../features/conversation.api";
import {
  addConversation,
  setConversations,
  setSelectedConversation,
} from "../redux/conversation.slice";
import { getMessages } from "../features/message.api";
import { setArtifacts, setMessages } from "../redux/message.slice";
import BillingDrawer from "./BillingDrawer";
import { TbLayoutSidebarRightExpand } from "react-icons/tb";
import { MdDelete } from "react-icons/md";
import { TiDelete } from "react-icons/ti";

/*
  Design tokens
  bg canvas:   #0a0a0d
  surface:     #121317
  hairline:    rgba(255,255,255,0.08)
  text hi:     #ece9e4  (warm off-white, not pure white)
  text mid:    #8b8d94
  text low:    #55575e
  accent:      #f2b632  (signal amber — the one bold color in the page)

  Signature move: conversations are marked by a thin amber signal-bar on
  the left edge (like a VU meter / active channel) rather than a filled
  pill — ties into a "signal" identity for an AI product instead of the
  generic gradient-button / filled-pill sidebar template.
*/

export default function Sidebar() {
  const [hovered, setHovered] = useState(null);
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [showBilling, setShowBilling] = useState(false);

  const { userData } = useSelector((state) => state.user);
  const { conversations, selectedConversation } = useSelector(
    (state) => state.conversation,
  );
  const dispatch = useDispatch();

  const logout = async () => {
    try {
      await api.get("/api/auth/logout");
      dispatch(setUserData(null));
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const data = await getConversations();
        dispatch(setConversations(data));
      } catch (error) {
        console.log(error);
      }
    };
    fetchConversations();
  }, [userData?._id]);

  const handleCreateConversation = () => {
    dispatch(setSelectedConversation(null));
    dispatch(setMessages([]));
    dispatch(setArtifacts([]));
    setMobileOpen(false);
  };

  const handleSelectConversation = async (conversation) => {
    setMobileOpen(false);
    dispatch(setSelectedConversation(conversation));
    const messages = await getMessages(conversation._id);
    dispatch(setMessages(messages));
    dispatch(setArtifacts(messages.artifacts));
  };

  const isCollapsed = collapsed;

  async function handleDeleteConversation(conversationId) {
    console.log("Deleting conversation with ID:", conversationId);
    try {
      const response = await api.delete(
        `/api/chat/delete-conversation/${conversationId}`,
      );
      dispatch(
        setConversations(
          conversations.filter((conv) => conv._id !== conversationId),
        ),
      );
    } catch (error) {
      console.log(error);
    }
  }

  return (
    <>
      {/* ── Mobile trigger ── */}
      <button
        onClick={() => setMobileOpen(true)}
        aria-label="Open sidebar"
        className={`lg:hidden fixed top-3.5 left-4 z-50 flex items-center justify-center w-9 h-9 rounded-md
          bg-[#121317]/95 backdrop-blur border border-white/[0.08] text-[#8b8d94]
          hover:text-[#ece9e4] hover:border-[#f2b632]/40 active:scale-90
          transition-all duration-150 cursor-pointer
          ${mobileOpen ? "opacity-0 pointer-events-none -translate-x-2" : "opacity-100"}`}
      >
        <Menu size={17} />
      </button>

      <div
        onClick={() => setMobileOpen(false)}
        aria-hidden="true"
        className={`lg:hidden fixed inset-0 z-40 bg-black/70 backdrop-blur-sm transition-opacity duration-300
          ${mobileOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
      />

      {/* ── Sidebar ── */}
      <div
        className={`
          fixed lg:static inset-y-0 left-0 z-50 flex flex-col shrink-0
          h-screen bg-[#0a0a0d] border-r border-white/[0.08] font-sans
          transition-[width,transform] duration-300 ease-in-out
          w-[82vw] max-w-[292px] sm:w-[280px]
          ${isCollapsed ? "lg:w-[60px]" : "lg:w-[280px]"}
          ${mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
      >
        {/* ── Wordmark row ── */}
        <div className="flex items-center gap-2.5 px-4 h-14 border-b border-white/[0.08] overflow-hidden shrink-0">
          <button
            onClick={() => setCollapsed((c) => !c)}
            aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            className="hidden lg:flex items-center justify-center w-6 h-6 rounded-md shrink-0
              bg-transparent border-none cursor-pointer group"
          >
            <span className="relative flex ">
              <TbLayoutSidebarRightExpand size={20} />
            </span>
          </button>

          <button
            onClick={() => setMobileOpen(false)}
            aria-label="Close sidebar"
            className="lg:hidden flex items-center justify-center w-7 h-7 rounded-md text-[#8b8d94]
              hover:text-[#ece9e4] active:scale-90 transition-all duration-150 bg-transparent border-none cursor-pointer"
          >
            <X size={16} />
          </button>

          <span
            className={`font-semibold text-[15px] text-[#ece9e4] tracking-tight flex-1 whitespace-nowrap
              transition-all duration-200 ${isCollapsed ? "lg:opacity-0 lg:w-0" : "opacity-100"}`}
          >
            MultiMind <span className="text-[#f2b632]">AI</span>
          </span>

          <span
            className={`font-mono text-[10px] tracking-widest text-[#f2b632]/80 whitespace-nowrap shrink-0
              transition-all duration-200 overflow-hidden
              ${isCollapsed ? "lg:opacity-0 lg:w-0" : "opacity-100"}`}
          >
            [{(userData?.plan ?? "pro").toUpperCase()}]
          </span>

          <button
            onClick={handleCreateConversation}
            aria-label="New chat"
            className={`items-center justify-center w-7 h-7 rounded-md text-[#8b8d94]
              hover:text-[#ece9e4] hover:bg-white/[0.06] active:scale-90
              transition-all duration-150 bg-transparent border-none cursor-pointer shrink-0
              ${isCollapsed ? "lg:hidden" : "flex"}`}
          >
            <PenSquare size={13} />
          </button>
        </div>

        {/* ── New chat (ghost / outline, not a gradient block) ── */}
        <div className="px-3 pt-3.5 pb-1">
          <button
            onClick={handleCreateConversation}
            aria-label="Start new chat"
            className={`group w-full flex items-center gap-2 text-[13px] font-medium text-[#ece9e4]
              border border-[#f2b632]/25 rounded-lg py-[9px] cursor-pointer bg-[#f2b632]/[0.04]
              hover:bg-[#f2b632]/[0.1] hover:border-[#f2b632]/50 active:scale-[0.98]
              transition-all duration-150
              ${isCollapsed ? "lg:justify-center lg:px-0 px-3.5" : "justify-center px-3.5"}`}
          >
            <Plus
              size={14}
              className="text-[#f2b632] transition-transform duration-200 group-hover:rotate-90 shrink-0"
            />
            <span
              className={`whitespace-nowrap ${isCollapsed ? "lg:hidden" : "inline"}`}
            >
              New chat
            </span>
          </button>
        </div>

        {/* ── Section marker ── */}
        <div
          className={`px-4 pt-4 pb-1.5 font-mono text-[10px] tracking-wider text-[#55575e]
            whitespace-nowrap overflow-hidden transition-all duration-200
            ${isCollapsed ? "lg:opacity-0 lg:h-0 lg:pt-0 lg:pb-0" : "opacity-100"}`}
        >
          //{" "}
          {conversations.length === 0
            ? "no conversations yet"
            : `recents · ${conversations.length}`}
        </div>

        {/* ── Chat list ── */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden px-2 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {conversations.map((chat, i) => {
            const isActive = selectedConversation?._id === chat._id;
            const isHov = hovered === chat._id;
            return (
              <div
                key={chat._id}
                role="button"
                tabIndex={0}
                onClick={() => handleSelectConversation(chat)}
                onKeyDown={(e) =>
                  e.key === "Enter" && handleSelectConversation(chat)
                }
                onMouseEnter={() => setHovered(chat._id)}
                onMouseLeave={() => setHovered(null)}
                style={{
                  animation: `fadeUp 220ms ease ${Math.min(i, 10) * 25}ms both`,
                }}
                className={`group relative flex items-center gap-2.5 cursor-pointer mb-[2px] py-2.5 pl-2.5 pr-2 rounded-md
                  transition-colors duration-150 focus-visible:outline focus-visible:outline-1 focus-visible:outline-[#f2b632]/60
                  ${isCollapsed ? "lg:justify-center lg:pl-0" : ""}
                  ${isActive ? "bg-white/[0.045]" : isHov ? "bg-white/[0.025]" : "bg-transparent"}`}
              >
                {/* signal bar — the signature element */}
                <span
                  className={`absolute left-0 top-1/2 -translate-y-1/2 w-[2px] rounded-full transition-all duration-200
                    ${isActive ? "h-4 bg-[#f2b632]" : "h-0 bg-transparent"}`}
                />

                <MessageSquare
                  size={13}
                  className={`shrink-0 transition-colors duration-150 ${isActive ? "text-[#f2b632]" : "text-[#55575e]"}`}
                />

                <div
                  className={`flex-1 min-w-0 flex items-center justify-between gap-2
  ${isCollapsed ? "lg:hidden" : ""}`}
                >
                  <p
                    className={`text-[13px] truncate transition-all duration-200
                    ${isActive ? "text-[#ece9e4] font-medium" : "text-[#8b8d94]"}
                    ${isCollapsed ? "lg:hidden" : ""}`}
                  >
                    {chat.title}
                  </p>
                  <TiDelete
                    size={16}
                    className="text-red-500"
                    onClick={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
                      handleDeleteConversation(chat._id);
                    }}
                  />
                </div>

                {/* tooltip in collapsed rail */}
                <span
                  className="hidden lg:block absolute left-full ml-2 top-1/2 -translate-y-1/2 whitespace-nowrap
                    bg-[#17181d] text-[#ece9e4] text-[12px] px-2.5 py-1.5 rounded-md border border-white/[0.08]
                    shadow-[0_4px_20px_rgba(0,0,0,0.5)] opacity-0 group-hover:opacity-100
                    pointer-events-none transition-opacity duration-150 z-10"
                  style={{ display: isCollapsed ? undefined : "none" }}
                >
                  {chat.title}
                </span>
              </div>
            );
          })}
        </div>

        <div className="mx-3 h-px bg-white/[0.08]" />

        {/* ── Footer ── */}
        <div className="px-2.5 py-3">
          {userData ? (
            <div
              className={`flex items-center gap-2.5 rounded-lg px-1.5 py-2 ${isCollapsed ? "lg:justify-center" : ""}`}
            >
              <div className="relative shrink-0">
                {!userData?.avatar || imageError ? (
                  <div className="w-8 h-8 rounded-md bg-white/[0.06] flex items-center justify-center border border-white/[0.08]">
                    <User size={14} className="text-[#8b8d94]" />
                  </div>
                ) : (
                  <img
                    src={userData.avatar}
                    alt={userData.name}
                    className="w-8 h-8 rounded-md object-cover border border-[#f2b632]/30"
                    onError={() => setImageError(true)}
                  />
                )}
                <span className="absolute -bottom-px -right-px w-[8px] h-[8px] bg-[#f2b632] rounded-full border-2 border-[#0a0a0d] block" />
              </div>

              <div
                className={`flex-1 min-w-0 ${isCollapsed ? "lg:hidden" : ""}`}
              >
                <p className="text-[13px] font-medium text-[#ece9e4] truncate">
                  {userData.name}
                </p>
                <p className="font-mono text-[10px] text-[#55575e] mt-px tracking-wide">
                  {userData.plan || "free plan"}
                </p>
              </div>

              <div
                className={`flex gap-0.5 shrink-0
                  ${isCollapsed ? "lg:flex-col lg:absolute lg:left-full lg:ml-2 lg:bottom-3 lg:bg-[#17181d] lg:border lg:border-white/[0.08] lg:rounded-lg lg:p-1 lg:shadow-[0_4px_20px_rgba(0,0,0,0.5)]" : ""}`}
              >
                <button
                  onClick={() => setShowBilling(true)}
                  aria-label="Billing"
                  className="flex items-center justify-center w-7 h-7 rounded-md border-none bg-transparent
                    text-[#f2b632]/70 cursor-pointer active:scale-90
                    hover:bg-[#f2b632]/10 hover:text-[#f2b632] transition-all duration-150"
                >
                  <CoinsIcon size={15} />
                </button>
                <button
                  onClick={logout}
                  aria-label="Log out"
                  className="flex items-center justify-center w-7 h-7 rounded-md border-none bg-transparent
                    text-[#55575e] cursor-pointer active:scale-90
                    hover:bg-[#e5484d]/10 hover:text-[#e5484d] transition-all duration-150"
                >
                  <LogOut size={13} />
                </button>
              </div>
            </div>
          ) : (
            <div className="px-1">
              <button
                className="w-full flex items-center justify-center gap-2 text-[13px] font-medium text-[#ece9e4]
                  bg-white/[0.04] border border-white/[0.08] rounded-lg py-[10px] cursor-pointer
                  hover:bg-white/[0.07] hover:border-white/[0.15] active:scale-[0.98] transition-all duration-150"
              >
                <User
                  size={14}
                  className={isCollapsed ? "hidden lg:block" : "hidden"}
                />
                <span className={isCollapsed ? "lg:hidden" : ""}>Log in</span>
              </button>
            </div>
          )}
        </div>
      </div>

      <BillingDrawer open={showBilling} onClose={() => setShowBilling(false)} />

      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(3px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </>
  );
}
