'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Search, MoreVertical, AtSign } from 'lucide-react';

interface Message {
  id: string;
  sender: string;
  senderRole: 'client' | 'editor' | 'creator';
  content: string;
  timestamp: string;
  isOwn?: boolean;
}

interface Conversation {
  id: string;
  participants: string[];
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  avatar?: string;
}

export default function MessagingInterface() {
  const [selectedConversation, setSelectedConversation] = useState<string>('conv-001');
  const [searchQuery, setSearchQuery] = useState('');
  const [newMessage, setNewMessage] = useState('');

  const conversations: Conversation[] = [
    {
      id: 'conv-001',
      participants: ['@fitness_sarah'],
      lastMessage: 'Thanks for the feedback on the latest draft!',
      lastMessageTime: '10:30 AM',
      unreadCount: 0,
    },
    {
      id: 'conv-002',
      participants: ['@instagram_coach_james'],
      lastMessage: 'Will send revisions by tomorrow',
      lastMessageTime: '9:15 AM',
      unreadCount: 2,
    },
    {
      id: 'conv-003',
      participants: ['@yoga_flow_amanda'],
      lastMessage: 'Looking forward to the campaign',
      lastMessageTime: 'Yesterday',
      unreadCount: 0,
    },
    {
      id: 'conv-004',
      participants: ['@travel_vlog_mike'],
      lastMessage: 'Can we schedule a call to discuss timings?',
      lastMessageTime: '2 days ago',
      unreadCount: 1,
    },
  ];

  const currentConv = conversations.find((c) => c.id === selectedConversation);

  const messages: Message[] = [
    {
      id: 'msg-001',
      sender: 'Marketing Team',
      senderRole: 'client',
      content: 'Hi Sarah! We loved the first reel. Can you add more of the product showcase in the beginning?',
      timestamp: '9:00 AM',
      isOwn: true,
    },
    {
      id: 'msg-002',
      sender: '@fitness_sarah',
      senderRole: 'creator',
      content: 'Thanks! I understood. I will rework the beginning to showcase more of the product. Will have it ready by tomorrow.',
      timestamp: '9:15 AM',
    },
    {
      id: 'msg-003',
      sender: 'Marketing Team',
      senderRole: 'client',
      content: 'Perfect! Also make sure the branding matches the latest guidelines we sent over.',
      timestamp: '9:20 AM',
      isOwn: true,
    },
    {
      id: 'msg-004',
      sender: '@fitness_sarah',
      senderRole: 'creator',
      content: 'Got it. Will check the guidelines and incorporate them. Thanks for the feedback!',
      timestamp: '9:30 AM',
    },
    {
      id: 'msg-005',
      sender: 'Marketing Team',
      senderRole: 'client',
      content: 'Thanks! Looking forward to seeing the updated version.',
      timestamp: '9:35 AM',
      isOwn: true,
    },
    {
      id: 'msg-006',
      sender: '@fitness_sarah',
      senderRole: 'creator',
      content: 'Thanks for the feedback on the latest draft!',
      timestamp: '10:30 AM',
    },
  ];

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;
    console.log('Message sent:', newMessage);
    setNewMessage('');
  };

  return (
    <div className="flex h-[600px] gap-4">
      {/* Conversations List */}
      <div className="w-full sm:w-64 flex-shrink-0 border border-neutral-700 rounded-lg bg-neutral-900/50 overflow-hidden flex flex-col">
        {/* Search */}
        <div className="p-4 border-b border-neutral-700">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-neutral-800/50 border border-neutral-700 rounded-lg text-sm text-neutral-50 placeholder-neutral-500 focus:outline-none focus:border-lime-400"
            />
          </div>
        </div>

        {/* Conversations */}
        <div className="flex-1 overflow-y-auto">
          {conversations.map((conv) => (
            <motion.button
              key={conv.id}
              onClick={() => setSelectedConversation(conv.id)}
              whileHover={{ backgroundColor: 'rgba(82, 82, 91, 0.2)' }}
              className={`w-full text-left p-4 border-b border-neutral-700 transition ${
                selectedConversation === conv.id
                  ? 'bg-neutral-800/50 border-l-2 border-l-lime-400'
                  : 'hover:bg-neutral-800/30'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-neutral-50 truncate">{conv.participants[0]}</p>
                  <p className="text-xs text-neutral-400 truncate mt-1">{conv.lastMessage}</p>
                </div>
                {conv.unreadCount > 0 && (
                  <div className="flex-shrink-0 w-5 h-5 rounded-full bg-lime-400 text-neutral-950 text-xs font-bold flex items-center justify-center">
                    {conv.unreadCount}
                  </div>
                )}
              </div>
              <p className="text-xs text-neutral-500 mt-2">{conv.lastMessageTime}</p>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 border border-neutral-700 rounded-lg bg-neutral-900/50 overflow-hidden flex flex-col hidden sm:flex">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-neutral-700 bg-neutral-800/50">
          <div>
            <h3 className="text-sm font-semibold text-neutral-50">{currentConv?.participants[0]}</h3>
            <p className="text-xs text-neutral-500 mt-1">Active now</p>
          </div>
          <button className="p-2 hover:bg-neutral-800 rounded-lg transition">
            <MoreVertical className="w-5 h-5 text-neutral-400" />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <AnimatePresence>
            {messages.map((msg, idx) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ delay: idx * 0.05 }}
                className={`flex ${msg.isOwn ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                    msg.isOwn
                      ? 'bg-lime-400 text-neutral-950 rounded-br-none'
                      : 'bg-neutral-800 text-neutral-50 rounded-bl-none border border-neutral-700'
                  }`}
                >
                  {!msg.isOwn && (
                    <p className="text-xs font-semibold mb-1 opacity-75">{msg.sender}</p>
                  )}
                  <p className="text-sm break-words">{msg.content}</p>
                  <p className={`text-xs mt-1 ${msg.isOwn ? 'text-neutral-900/60' : 'text-neutral-500'}`}>
                    {msg.timestamp}
                  </p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Input */}
        <div className="border-t border-neutral-700 p-4 bg-neutral-800/30">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <AtSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                placeholder="Type your message..."
                className="w-full pl-9 pr-3 py-2 bg-neutral-800/50 border border-neutral-700 rounded-lg text-sm text-neutral-50 placeholder-neutral-500 focus:outline-none focus:border-lime-400 resize-none"
              />
            </div>
            <button
              onClick={handleSendMessage}
              disabled={!newMessage.trim()}
              className="flex-shrink-0 px-4 py-2 bg-lime-400 hover:bg-lime-300 text-neutral-950 font-semibold rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
