// frontend/src/components/FloatingContact.jsx
import React, { useState } from 'react';
import { MessageCircle, X } from 'lucide-react';

const FloatingContact = () => {
  const [isExpanded, setIsExpanded] = useState(false);

  const contacts = {
    zalo: {
      phone: '0902145018',
      link: 'https://zalo.me/0902145018',
      color: 'bg-blue-500',
      hoverColor: 'hover:bg-blue-600',
      icon: (
        <svg className="w-6 h-6" viewBox="0 0 48 48" fill="none">
          <path
            d="M24 4C12.96 4 4 12.96 4 24c0 9.52 6.64 17.48 15.52 19.52v-13.8h-4.68v-5.72h4.68v-4.36c0-4.62 2.76-7.18 6.98-7.18 2.02 0 4.14.36 4.14.36v4.56h-2.34c-2.3 0-3.02 1.42-3.02 2.88v3.46h5.14l-.82 5.72h-4.32v13.8C37.36 41.48 44 33.52 44 24c0-11.04-8.96-20-20-20z"
            fill="currentColor"
          />
        </svg>
      ),
      name: 'Zalo'
    },
    messenger: {
      link: 'https://www.facebook.com/nguyen.t.thuy.3950',
      color: 'bg-blue-600',
      hoverColor: 'hover:bg-blue-700',
      icon: (
        <svg className="w-6 h-6" viewBox="0 0 48 48" fill="none">
          <path
            d="M24 4C12.96 4 4 12.5 4 23.16c0 6.02 3.02 11.38 7.74 14.9v6.94l6.7-3.68c1.78.5 3.68.76 5.56.76 11.04 0 20-8.5 20-19.16C44 12.5 35.04 4 24 4zm2.12 25.8l-5.12-5.46-10 5.46L21.88 18.2l5.24 5.46 9.88-5.46L26.12 29.8z"
            fill="currentColor"
          />
        </svg>
      ),
      name: 'Messenger'
    },
    phone: {
      number: '0902145018',
      link: 'tel:0902145018',
      color: 'bg-green-500',
      hoverColor: 'hover:bg-green-600',
      icon: (
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
          <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
        </svg>
      ),
      name: 'Hotline'
    }
  };

  return (
    <>
      <div className="fixed bottom-4 right-4 md:bottom-6 md:right-6 z-50 flex flex-col items-end gap-3">
        <div
          className={`flex flex-col gap-3 transition-all duration-300 ${
            isExpanded
              ? 'opacity-100 translate-y-0'
              : 'opacity-0 translate-y-2 pointer-events-none md:opacity-100 md:translate-y-0 md:pointer-events-auto'
          }`}
        >
          {/* Zalo Button */}
          <a
            href={contacts.zalo.link}
            target="_blank"
            rel="noopener noreferrer"
            className={`group relative ${contacts.zalo.color} ${contacts.zalo.hoverColor} text-white p-3 md:p-4 rounded-full shadow-lg transition-all duration-300 hover:scale-110 active:scale-95 animate-bounce-slow`}
            title={`Chat qua ${contacts.zalo.name}: ${contacts.zalo.phone}`}
            style={{ animationDelay: '0s' }}
          >
            {contacts.zalo.icon}
            <span className="hidden md:block absolute right-full mr-3 top-1/2 -translate-y-1/2 bg-gray-900 text-white text-xs px-3 py-2 rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-xl">
              Chat Zalo: {contacts.zalo.phone}
            </span>
          </a>

          {/* Messenger Button */}
          <a
            href={contacts.messenger.link}
            target="_blank"
            rel="noopener noreferrer"
            className={`group relative ${contacts.messenger.color} ${contacts.messenger.hoverColor} text-white p-3 md:p-4 rounded-full shadow-lg transition-all duration-300 hover:scale-110 active:scale-95 animate-bounce-slow`}
            title={`Chat qua ${contacts.messenger.name}`}
            style={{ animationDelay: '0.1s' }}
          >
            {contacts.messenger.icon}
          </a>

          {/* Phone */}
          <a
            href={contacts.phone.link}
            className={`group relative ${contacts.phone.color} ${contacts.phone.hoverColor} text-white p-3 md:p-4 rounded-full shadow-lg transition-all duration-300 hover:scale-110 active:scale-95 animate-bounce-slow`}
            title={`Gọi: ${contacts.phone.number}`}
            style={{ animationDelay: '0.2s' }}
          >
            {contacts.phone.icon}
          </a>
        </div>

        {/* Toggle - mobile */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className={`md:hidden ${
            isExpanded ? 'bg-red-500 hover:bg-red-600' : 'bg-rose-600 hover:bg-rose-700'
          } text-white p-4 rounded-full shadow-lg transition-all duration-300 hover:scale-110 active:scale-95`}
        >
          {isExpanded ? <X size={24} /> : <MessageCircle size={24} className="animate-pulse" />}
        </button>
      </div>

      {/* Backdrop */}
      {isExpanded && (
        <div
          className="md:hidden fixed inset-0 bg-black/20 z-40"
          onClick={() => setIsExpanded(false)}
        />
      )}
    </>
  );
};

export default FloatingContact;
