'use client'
import Image from "next/image";
import ChatHamburger from "../../../employers-dashboard/messages/components/ChatHamburger";
import aiChatScript from "@/data/aiChatScript";
import { useState } from "react";
import { useRef, useEffect } from "react";

const ChatBoxContentField = () => {
  const [message, setMessage] = useState("");

  const [messages, setMessages] = useState([
    {
      sender: "ai",
      text: "👋 Hello Samir!",
      time: "Now",
    },
    {
      sender: "ai",
      text: "I'm your AI Career Assistant.",
      time: "Now",
    },
    {
      sender: "ai",
      text: "I can help you with:\n\n• Resume Review\n• Job Recommendations\n• Mock Interview\n• Resume Improvement\n• Salary Estimation\n\nChoose one of the options below or ask me anything.",
      time: "Now",
    },
  ]);

  const getAIResponse = (text) => {
    const match = aiChatScript.find((item) =>
      text.toLowerCase().includes(item.question.toLowerCase())
    );

    return match
      ? match.answer
      : "😊 Sorry, I don't understand that yet. Try asking about Resume, Jobs, Interview, Salary or Skills.";
  };

  const sendMessage = (e, customMessage = null) => {
    if (e) e.preventDefault();

    const text = customMessage || message;

    if (!text.trim()) return;
    const userMessage = {
      sender: "user",
      text,
      time: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };
    setMessages((prev) => [...prev, userMessage]);

    setMessage("");

    setIsTyping(true);

    setTimeout(() => {
      const aiMessage = {
        sender: "ai",
        text: getAIResponse(text),
        time: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };

      setMessages((prev) => [...prev, aiMessage]);

      setIsTyping(false);
    }, 1200);
  };

  const [isTyping, setIsTyping] = useState(false);
  const quickActions = [
    "Resume Review",
    "Find Jobs",
    "Mock Interview",
    "Salary Estimate",
    "Career Advice",
  ];
  const bottomRef = useRef(null);
  useEffect(() => {
    bottomRef.current?.scrollIntoView({
      behavior: "smooth"
    });
  }, [messages]);
  useEffect(() => {

    const history = localStorage.getItem("ai-chat");

    if (history) {
      setMessages(JSON.parse(history));
    }

  }, []);
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem("ai-chat", JSON.stringify(messages));
    }
  }, [messages]);

  const clearChat = () => {
    localStorage.removeItem("ai-chat");

    setIsTyping(false);
    setMessage("");

    setMessages([
      {
        sender: "ai",
        text: "👋 Hello Samir!",
        time: "Now",
      },
      {
        sender: "ai",
        text: "I'm your AI Career Assistant.",
        time: "Now",
      },
      {
        sender: "ai",
        text:
          "I can help you with:\n\n• Resume Review\n• Job Recommendations\n• Mock Interview\n• Resume Improvement\n• Salary Estimation\n\nChoose one of the options below or ask me anything.",
        time: "Now",
      },
    ]);
  };
  return (
    <div className="card message-card">
      <div className="card-header msg_head">
        <div className="d-flex bd-highlight">
          <div className="img_cont">
            <Image
              width={48}
              height={48}
              src="/images/resource/candidate-8.png"
              alt="48"
              className="rounded-circle user_img"
            />
          </div>
          <div className="user_info">
            <span>🤖 AI Career Assistant</span>
            <p>Online</p>
          </div>
        </div>

        <div className="btn-box">
          <button
            type="button"
            className="dlt-chat btn-sm"
            onClick={clearChat}
          >
            <i className="la la-trash me-2"></i>
            Clear Chat
          </button>
          <ChatHamburger />
        </div>
      </div>
      {/* End .cart-header */}

      <div className="card-body msg_card_body">
        {messages.map((item, index) => (

          <div
            key={index}
            className={
              item.sender === "ai"
                ? "d-flex justify-content-start mb-3"
                : "d-flex justify-content-end mb-3"
            }
          >

            <div
              className={
                item.sender === "ai"
                  ? "msg_cotainer"
                  : "msg_cotainer_send"
              }
            >

              <div style={{ whiteSpace: "pre-line" }}>
                {item.text}
              </div>

              <div className="msg_time mt-1">
                {item.time}
              </div>

            </div>

          </div>

        ))}
        {isTyping && (

          <div className="d-flex justify-content-start mb-3">

            <div className="msg_cotainer">
              <div className="typing-loader">
                <span></span>
                <span></span>
                <span></span>
              </div>

              <div className="mt-1">
                AI is typing...
              </div>

            </div>

          </div>

        )}
        <div ref={bottomRef}></div>
      </div>
      <div className="quick-actions px-3 py-2">

        {quickActions.map((action) => (

          <button
            key={action}
            className="theme-btn btn-style-three me-2 mb-2"
            onClick={() => sendMessage(null, action)}
            type="button"
          >
            {action}
          </button>

        ))}

      </div>
      {/* End .card-body */}

      <div className="card-footer">
        <div className="form-group mb-0">
          <form onSubmit={sendMessage}>
            <textarea
              rows={2}
              disabled={isTyping}
              className="form-control type_msg"
              placeholder="Ask AI anything about your career..."

              value={message}

              onChange={(e) => setMessage(e.target.value)}

              onKeyDown={(e) => {

                if (e.key === "Enter" && !e.shiftKey) {

                  e.preventDefault();

                  sendMessage(e);

                }

              }}
            />
            <button
              disabled={isTyping}
              type="submit"
              className="theme-btn btn-style-one submit-btn"
            >
              Send
            </button>
          </form>
        </div>
      </div>
      {/* End .card-footer */}
    </div>
  );
};

export default ChatBoxContentField;
