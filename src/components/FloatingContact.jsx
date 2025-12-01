// src/components/FloatingContact.jsx
import React, { useState } from "react";
import { MessageCircle, X, Phone } from "lucide-react";
import zaloIcon from "../assets/Logo-Zalo-App-Rec.webp"; // ← Import icon Zalo

const FloatingContact = () => {
  const [isExpanded, setIsExpanded] = useState(false);

  // 🔥 THAY ĐỔI THÔNG TIN LIÊN HỆ TẠI ĐÂY
  const contacts = {
    zalo: {
      label: "Chat Zalo",
      phone: "0914465111", // ← Thay số Zalo
      icon: zaloIcon,
      link: "https://zalo.me/0914465111",
      bgColor: "bg-blue-500",
      hoverColor: "hover:bg-blue-600",
      textColor: "text-white",
    },
    messenger: {
      label: "Messenger",
      icon: "https://upload.wikimedia.org/wikipedia/commons/b/be/Facebook_Messenger_logo_2020.svg",
      link: "https://www.facebook.com/nguyen.t.thuy.3950",
      bgColor: "bg-blue-600",
      hoverColor: "hover:bg-blue-700",
      textColor: "text-white",
    },
    phone: {
      label: "Gọi điện",
      phone: "0914465111",
      link: "tel:0914465111",
      bgColor: "bg-green-500",
      hoverColor: "hover:bg-green-600",
      textColor: "text-white",
    },
  };

  return (
    <>
      <div className="fixed bottom-4 right-4 md:bottom-6 md:right-6 z-50 flex flex-col items-end gap-2 md:gap-3">
        {/* Danh sách liên hệ */}
        <div
          className={`
            flex flex-col gap-2 md:gap-3 transition-all duration-300 ease-out
            ${
              isExpanded
                ? "opacity-100 translate-y-0 pointer-events-auto"
                : "opacity-0 translate-y-4 pointer-events-none md:opacity-100 md:translate-y-0 md:pointer-events-auto"
            }
          `}
        >
          {/* Zalo Button */}
          <a
            href={contacts.zalo.link}
            target="_blank"
            rel="noopener noreferrer"
            className={`
              group relative flex items-center gap-2 md:gap-3
              ${contacts.zalo.bgColor} ${contacts.zalo.hoverColor} ${contacts.zalo.textColor}
              px-4 py-3 md:px-5 md:py-3.5 rounded-full shadow-lg
              transition-all duration-300 hover:scale-105 active:scale-95
              animate-slide-in-right
            `}
            style={{ animationDelay: "0s" }}
            title={`${contacts.zalo.label}: ${contacts.zalo.phone}`}
          >
            <img
              src={contacts.zalo.icon}
              alt="Zalo"
              className="w-6 h-6 md:w-7 md:h-7 object-contain flex-shrink-0"
            />
            <span className="hidden md:inline font-medium text-sm whitespace-nowrap">
              {contacts.zalo.label}
            </span>
          </a>

          {/* Messenger Button */}
          <a
            href={contacts.messenger.link}
            target="_blank"
            rel="noopener noreferrer"
            className={`
              group relative flex items-center gap-2 md:gap-3
              ${contacts.messenger.bgColor} ${contacts.messenger.hoverColor} ${contacts.messenger.textColor}
              px-4 py-3 md:px-5 md:py-3.5 rounded-full shadow-lg
              transition-all duration-300 hover:scale-105 active:scale-95
              animate-slide-in-right
            `}
            style={{ animationDelay: "0.1s" }}
            title={contacts.messenger.label}
          >
            <img
              src={contacts.messenger.icon}
              alt="Messenger"
              className="w-6 h-6 md:w-7 md:h-7 object-contain flex-shrink-0"
            />
            <span className="hidden md:inline font-medium text-sm whitespace-nowrap">
              {contacts.messenger.label}
            </span>
          </a>

          {/* Phone Button */}
          <a
            href={contacts.phone.link}
            className={`
              group relative flex items-center gap-2 md:gap-3
              ${contacts.phone.bgColor} ${contacts.phone.hoverColor} ${contacts.phone.textColor}
              px-4 py-3 md:px-5 md:py-3.5 rounded-full shadow-lg
              transition-all duration-300 hover:scale-105 active:scale-95
              animate-slide-in-right
            `}
            style={{ animationDelay: "0.2s" }}
            title={`${contacts.phone.label}: ${contacts.phone.phone}`}
          >
            <Phone className="w-6 h-6 md:w-7 md:h-7 flex-shrink-0" />
            <span className="hidden md:inline font-medium text-sm whitespace-nowrap">
              {contacts.phone.label}
            </span>
          </a>
        </div>

        {/* Toggle Button - Mobile Only */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className={`
            md:hidden
            ${isExpanded ? "bg-red-500 hover:bg-red-600" : "bg-rose-600 hover:bg-rose-700"}
            text-white p-4 rounded-full shadow-lg
            transition-all duration-300 hover:scale-110 active:scale-95
            ${!isExpanded && "animate-pulse-ring"}
          `}
          aria-label={isExpanded ? "Đóng" : "Liên hệ"}
        >
          {isExpanded ? (
            <X size={24} className="transition-transform duration-300" />
          ) : (
            <MessageCircle size={24} className="animate-pulse" />
          )}
        </button>
      </div>

      {/* Backdrop - Mobile Only */}
      {isExpanded && (
        <div
          className="md:hidden fixed inset-0 bg-black/30 backdrop-blur-sm z-40 transition-opacity duration-300"
          onClick={() => setIsExpanded(false)}
        />
      )}
    </>
  );
};

export default FloatingContact;

