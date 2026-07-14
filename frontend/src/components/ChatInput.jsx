import { useState } from "react";
import {
  Send,
  Paperclip,
  Square,
  Zap,
  MessageSquare,
  Code2,
  Presentation,
  Image as ImageIcon,
  Globe,
  FileText,
  X,
} from "lucide-react";
import { IoSend } from "react-icons/io5";
import { useDispatch, useSelector } from "react-redux";
import { addMessage, setArtifacts, setIsLoading } from "../redux/message.slice";
import { sendPrompt } from "../features/agent.api";
import { Mic, MicOff } from "lucide-react";
import { useEffect } from "react";
import {
  createConversation,
  updateConversations,
} from "../features/conversation.api";
import {
  addConversation,
  setConvTitle,
  setSelectedConversation,
} from "../redux/conversation.slice";
import { useRef } from "react";

export default function ChatInput({ setBanner }) {
  const [selectedAgent, setSelectedAgent] = useState("auto");
  const [value, setValue] = useState("");
  const [isListening, setIsListening] = useState(false);

  const recognitionRef = useRef(null);
  const dispatch = useDispatch();
  const { selectedConversation } = useSelector((state) => state.conversation);
  const { isLoading } = useSelector((state) => state.message);
  const fileRef = useRef(null);

  const [selectedFile, setSelectedFile] = useState(null);

  const placeholders = {
    auto: "Ask MultiMind AI...",

    chat: "Chat with MultiMind AI...",

    coding: "Describe the software you want...",

    pdf: "Generate a PDF about...",

    ppt: "Create a presentation about...",

    image: "Describe the image...",

    search: "Search the web...",
  };

  const agents = [
    {
      id: "auto",
      icon: Zap,
      label: "Auto",
    },

    {
      id: "chat",
      icon: MessageSquare,
      label: "Chat",
    },

    {
      id: "coding",
      icon: Code2,
      label: "Coding",
    },

    {
      id: "pdf",
      icon: FileText,
      label: "PDF",
    },

    {
      id: "ppt",
      icon: Presentation,
      label: "PPT",
    },

    {
      id: "image",
      icon: ImageIcon,
      label: "Image",
    },

    {
      id: "search",
      icon: Globe,
      label: "Search",
    },
  ];

  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();

    recognition.lang = "en-IN";

    recognition.interimResults = true;

    recognition.continuous = true;

    recognition.onresult = (event) => {
      let transcript = "";

      for (let i = event.resultIndex; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript;
      }

      setValue(transcript);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;
  }, []);

  const toggleMic = () => {
    if (!recognitionRef.current) {
      alert("Speech Recognition not supported");

      return;
    }

    if (isListening) {
      recognitionRef.current.stop();

      setIsListening(false);
    } else {
      recognitionRef.current.start();

      setIsListening(true);
    }
  };

  const handleSend = async () => {
    const prompt = value.trim();
    if (!prompt) return;

    dispatch(setIsLoading(true));

    try {
      let conversation = selectedConversation;

      if (!conversation) {
        const newConversation = await createConversation();
        dispatch(addConversation(newConversation));
        dispatch(setSelectedConversation(newConversation));
        conversation = newConversation;
      }

      if (conversation.title === "New Chat") {
        await updateConversations(conversation._id, prompt.slice(0, 40));
        dispatch(
          setConvTitle({
            conversationId: conversation._id,
            title: prompt.slice(0, 40),
          }),
        );
      }

      dispatch(addMessage({ role: "user", content: prompt }));
      setValue("");

      const formData = new FormData();

      formData.append("conversationId", conversation._id);

      formData.append("prompt", prompt);

      formData.append("agent", selectedAgent);

      if (selectedFile) {
        formData.append("file", selectedFile);
      }

      setSelectedFile(null);

      const data = await sendPrompt(formData);
      console.log(data);
      dispatch(
        addMessage({
          role: "assistant",
          content: data.answer,
          images: data.images,
        }),
      );

      console.log(data);

      if (data.artifacts) {
        dispatch(setArtifacts(data.artifacts));
      }
    } catch (error) {
      setBanner({
        open: true,

        title: error.response?.data?.title || "Something went wrong",

        message: error.response?.data?.message || "Please try again.",
      });
    } finally {
      dispatch(setIsLoading(false));
    }
  };

  return (
    <div className="w-full overflow-hidden px-3 md:px-5 py-4 border-t border-white/[0.08] bg-[#0a0a0d]">
      <div className="flex flex-col gap-2 bg-[#121317] border border-white/[0.08] rounded-2xl px-4 pt-3.5 pb-3 transition-colors duration-150 focus-within:border-[#f2b632]/40">
        {/* Agent selector */}
        <div className="flex gap-1.5 pr-2 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {agents.map((agent) => {
            const Icon = agent.icon;
            const isActive = selectedAgent === agent.id;

            return (
              <button
                key={agent.id}
                onClick={() => setSelectedAgent(agent.id)}
                className={`
                  flex-shrink-0
                  inline-flex
                  items-center
                  gap-1.5
                  px-3
                  py-[7px]
                  rounded-full
                  text-[11.5px]
                  font-medium
                  border
                  cursor-pointer
                  active:scale-95
                  transition-all
                  duration-150
                  ${
                    isActive
                      ? "bg-[#f2b632]/[0.12] text-[#f2b632] border-[#f2b632]/40"
                      : "bg-transparent text-[#8b8d94] border-white/[0.08] hover:bg-white/[0.05] hover:text-[#ece9e4] hover:border-white/[0.15]"
                  }
                `}
              >
                <Icon
                  size={13}
                  className={isActive ? "text-[#f2b632]" : "text-[#55575e]"}
                />
                {agent.label}
              </button>
            );
          })}
        </div>

        {/* Attached file preview */}
        {selectedFile && (
          <div className="mt-1">
            <div
              className="inline-flex items-center gap-2.5 rounded-xl border border-white/[0.08] bg-white/[0.03] pl-2.5 pr-2 py-2"
              style={{ animation: "fadeUp 180ms ease both" }}
            >
              {selectedFile.type === "application/pdf" ? (
                <div className="w-9 h-9 rounded-lg bg-[#e5484d]/10 flex items-center justify-center shrink-0">
                  <FileText size={15} className="text-[#e5484d]" />
                </div>
              ) : (
                selectedFile?.type.startsWith("image/") && (
                  <img
                    src={URL.createObjectURL(selectedFile)}
                    className="h-9 w-9 rounded-lg object-cover shrink-0"
                  />
                )
              )}

              <div className="min-w-0">
                <p className="text-[12px] text-[#ece9e4] truncate max-w-[160px]">
                  {selectedFile.name}
                </p>
                <p className="font-mono text-[10px] text-[#55575e]">
                  {Math.ceil(selectedFile.size / 1024)}KB
                </p>
              </div>

              <button
                onClick={() => {
                  setSelectedFile(null);
                  fileRef.current.value = "";
                }}
                aria-label="Remove attachment"
                className="ml-1 w-6 h-6 flex items-center justify-center rounded-md hover:bg-white/[0.08] active:scale-90 transition-all duration-150"
              >
                <X size={13} className="text-[#55575e] hover:text-[#ece9e4]" />
              </button>
            </div>
          </div>
        )}

        {/* Textarea */}
        <textarea
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
          placeholder={placeholders[selectedAgent]}
          rows={2}
          disabled={isLoading}
          className="w-full bg-transparent outline-none resize-none text-[14px] text-[#ece9e4] placeholder:text-[#55575e] leading-relaxed [scrollbar-width:none] [&::-webkit-scrollbar]:hidden disabled:opacity-50 mt-1"
        />

        {/* Bottom row */}
        <div className="flex items-center justify-between">
          {/* Left — attach + mic */}
          <div className="flex items-center gap-1">
            <input
              ref={fileRef}
              type="file"
              hidden
              accept=".pdf,image/*"
              onChange={(e) => {
                const file = e.target.files[0];

                if (file) {
                  setSelectedFile(file);
                }
              }}
            />
            <button
              aria-label="Attach file"
              className="flex items-center justify-center w-8 h-8 rounded-lg text-[#55575e] hover:text-[#ece9e4] hover:bg-white/[0.06] border border-transparent hover:border-white/[0.08] active:scale-90 transition-all duration-150 bg-transparent cursor-pointer"
              onClick={() => fileRef.current.click()}
            >
              <Paperclip size={14} />
            </button>
            <button
              onClick={toggleMic}
              aria-label={isListening ? "Stop dictation" : "Start dictation"}
              className={`relative flex items-center justify-center w-8 h-8 rounded-lg border-none active:scale-90 transition-all duration-150 cursor-pointer
                ${
                  isListening
                    ? "bg-[#e5484d]/15 text-[#e5484d]"
                    : "bg-transparent text-[#55575e] hover:bg-white/[0.06] hover:text-[#ece9e4]"
                }`}
            >
              {isListening && (
                <span className="absolute inset-0 rounded-lg animate-ping bg-[#e5484d]/25" />
              )}
              <span className="relative">
                {isListening ? <MicOff size={14} /> : <Mic size={14} />}
              </span>
            </button>
          </div>

          {/* Right — send / stop */}
          <button
            onClick={handleSend}
            disabled={!isLoading && !value.trim()}
            aria-label={isLoading ? "Stop generating" : "Send message"}
            className={`flex items-center justify-center w-8 h-8 rounded-lg border-none cursor-pointer active:scale-90 transition-all duration-150
              ${
                isLoading
                  ? "bg-[#ece9e4] text-[#0a0a0d] hover:brightness-90"
                  : value.trim()
                    ? "bg-[#f2b632] text-[#0a0a0d] hover:brightness-110 shadow-[0_1px_10px_rgba(242,182,50,0.25)]"
                    : "bg-white/[0.05] text-[#55575e] cursor-not-allowed"
              }`}
          >
            {isLoading ? (
              <Square size={12} fill="currentColor" />
            ) : (
              <IoSend size={18} />
            )}
          </button>
        </div>
      </div>

      {/* <p className="text-center font-mono text-[10px] tracking-wide text-[#3f4046] mt-2.5">
        MultiMindAI can make mistakes. Verify important info.
      </p> */}

      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(3px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
