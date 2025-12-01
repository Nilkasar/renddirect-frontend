import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { chatAPI } from '../../lib/api';
import { Conversation, Message } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import {
  MessageCircle, X, Send, ChevronLeft, Home,
  Sparkles, Check, CheckCheck, Minimize2, Maximize2
} from 'lucide-react';
import toast from 'react-hot-toast';

// Safe date formatting with fallback
const formatTime = (dateString: string | undefined | null): string => {
  if (!dateString) return '';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '';
    return date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
  } catch {
    return '';
  }
};

const formatRelativeTime = (dateString: string | undefined | null): string => {
  if (!dateString) return '';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '';

    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
  } catch {
    return '';
  }
};

// Pulse animation for notification badge
const PulseBadge: React.FC<{ count: number }> = ({ count }) => (
  <motion.div
    initial={{ scale: 0 }}
    animate={{ scale: 1 }}
    className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-white text-xs font-bold"
  >
    <motion.div
      className="absolute inset-0 bg-red-500 rounded-full"
      animate={{ scale: [1, 1.5, 1], opacity: [1, 0, 1] }}
      transition={{ duration: 2, repeat: Infinity }}
    />
    <span className="relative z-10">{count > 9 ? '9+' : count}</span>
  </motion.div>
);

// Typing indicator animation
const TypingIndicator: React.FC = () => (
  <div className="flex items-center gap-1 px-4 py-2">
    <div className="flex gap-1">
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="w-2 h-2 bg-gray-400 rounded-full"
          animate={{ y: [0, -5, 0] }}
          transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
        />
      ))}
    </div>
    <span className="text-xs text-gray-400 ml-2">typing...</span>
  </div>
);

// Individual message bubble
const MessageBubble: React.FC<{ message: Message; isMe: boolean }> = ({ message, isMe }) => (
  <motion.div
    initial={{ opacity: 0, y: 10, scale: 0.95 }}
    animate={{ opacity: 1, y: 0, scale: 1 }}
    className={`flex ${isMe ? 'justify-end' : 'justify-start'} mb-2`}
  >
    <div
      className={`max-w-[80%] rounded-2xl px-4 py-2 ${
        isMe
          ? 'bg-gradient-to-r from-primary-500 to-purple-500 text-white rounded-br-sm'
          : 'bg-gray-100 text-gray-900 rounded-bl-sm'
      }`}
    >
      <p className="text-sm break-words">{message.content}</p>
      <div className={`flex items-center justify-end gap-1 mt-1 ${isMe ? 'text-white/70' : 'text-gray-400'}`}>
        <span className="text-[10px]">{formatTime(message.createdAt)}</span>
        {isMe && (
          message.status === 'READ' ? (
            <CheckCheck className="w-3 h-3 text-blue-300" />
          ) : (
            <Check className="w-3 h-3" />
          )
        )}
      </div>
    </div>
  </motion.div>
);

// Conversation list item
const ConversationItem: React.FC<{
  conversation: Conversation;
  isSelected: boolean;
  onClick: () => void;
  currentUserId: string;
}> = ({ conversation, isSelected, onClick, currentUserId }) => {
  const otherUser = conversation.ownerId === currentUserId ? conversation.tenant : conversation.owner;
  const lastMessage = conversation.messages?.[0];

  return (
    <motion.button
      whileHover={{ scale: 1.02, x: 5 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`w-full p-3 rounded-xl text-left transition-all ${
        isSelected
          ? 'bg-gradient-to-r from-primary-50 to-purple-50 border-l-4 border-primary-500'
          : 'hover:bg-gray-50'
      }`}
    >
      <div className="flex items-center gap-3">
        <div className="relative">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-400 to-purple-400 flex items-center justify-center text-white font-semibold text-sm">
            {otherUser.firstName[0]}{otherUser.lastName[0]}
          </div>
          <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <span className="font-medium text-gray-900 truncate text-sm">
              {otherUser.firstName} {otherUser.lastName}
            </span>
            {conversation.lastMessageAt && (
              <span className="text-[10px] text-gray-400">
                {formatRelativeTime(conversation.lastMessageAt)}
              </span>
            )}
          </div>
          <div className="flex items-center gap-1 text-xs text-gray-500 truncate">
            <Home className="w-3 h-3 flex-shrink-0" />
            <span className="truncate">{conversation.property.title}</span>
          </div>
          {lastMessage && (
            <p className="text-xs text-gray-400 truncate mt-0.5">{lastMessage.content}</p>
          )}
        </div>
      </div>
    </motion.button>
  );
};

const FloatingChatWidget: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const {
    joinConversation,
    leaveConversation,
    onNewMessage,
    markAsRead,
    onTypingStart,
    onTypingStop,
    startTyping,
    stopTyping,
  } = useSocket();

  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Fetch conversations
  useEffect(() => {
    if (isAuthenticated && isOpen) {
      fetchConversations();
    }
  }, [isAuthenticated, isOpen]);

  // Fetch unread count
  useEffect(() => {
    if (isAuthenticated) {
      fetchUnreadCount();
    }
  }, [isAuthenticated]);

  // Socket listeners for new messages
  useEffect(() => {
    if (!isAuthenticated) return;

    const unsubscribe = onNewMessage((message: Message) => {
      if (selectedConversation && message.conversationId === selectedConversation.id) {
        setMessages((prev) => [...prev, message]);
        scrollToBottom();
        markAsRead(selectedConversation.id);
      } else {
        // Increment unread count for messages in other conversations
        setUnreadCount((prev) => prev + 1);
      }
      // Refresh conversations list
      fetchConversations();
    });

    return unsubscribe;
  }, [isAuthenticated, selectedConversation, onNewMessage]);

  // Typing indicators
  useEffect(() => {
    if (!selectedConversation) return;

    const unsubTypingStart = onTypingStart(({ conversationId, userId }) => {
      if (conversationId === selectedConversation.id && userId !== user?.id) {
        setIsTyping(true);
      }
    });

    const unsubTypingStop = onTypingStop(({ conversationId, userId }) => {
      if (conversationId === selectedConversation.id && userId !== user?.id) {
        setIsTyping(false);
      }
    });

    return () => {
      if (typeof unsubTypingStart === 'function') unsubTypingStart();
      if (typeof unsubTypingStop === 'function') unsubTypingStop();
    };
  }, [selectedConversation, onTypingStart, onTypingStop, user?.id]);

  const fetchConversations = async () => {
    try {
      const response = await chatAPI.getConversations();
      if (response.data.success) {
        setConversations(response.data.data);
      }
    } catch (error) {
      console.error('Failed to load conversations');
    }
  };

  const fetchUnreadCount = async () => {
    try {
      const response = await chatAPI.getUnreadCount();
      if (response.data.success) {
        setUnreadCount(response.data.data.count || 0);
      }
    } catch (error) {
      console.error('Failed to fetch unread count');
    }
  };

  const fetchMessages = async (conversationId: string) => {
    setIsLoading(true);
    try {
      const response = await chatAPI.getMessages(conversationId);
      if (response.data.success) {
        setMessages(response.data.data.items || []);
        scrollToBottom();
      }
    } catch (error) {
      toast.error('Failed to load messages');
    } finally {
      setIsLoading(false);
    }
  };

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const handleSelectConversation = (conv: Conversation) => {
    if (selectedConversation) {
      leaveConversation(selectedConversation.id);
    }
    setSelectedConversation(conv);
    joinConversation(conv.id);
    fetchMessages(conv.id);
    markAsRead(conv.id);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || isSending || !selectedConversation) return;

    setIsSending(true);
    const messageContent = newMessage.trim();
    setNewMessage('');

    try {
      const response = await chatAPI.sendMessage(selectedConversation.id, messageContent);
      if (response.data.success) {
        setMessages((prev) => [...prev, response.data.data]);
        scrollToBottom();
      }
    } catch (error) {
      toast.error('Failed to send message');
      setNewMessage(messageContent);
    } finally {
      setIsSending(false);
    }
  };

  const handleTyping = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewMessage(e.target.value);

    if (selectedConversation) {
      startTyping(selectedConversation.id);

      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      typingTimeoutRef.current = setTimeout(() => {
        stopTyping(selectedConversation.id);
      }, 2000);
    }
  };

  const handleBack = () => {
    if (selectedConversation) {
      leaveConversation(selectedConversation.id);
    }
    setSelectedConversation(null);
    setMessages([]);
  };

  const handleOpenFullMessages = () => {
    setIsOpen(false);
    navigate('/messages');
  };

  if (!isAuthenticated) return null;

  const otherUser = selectedConversation
    ? (selectedConversation.ownerId === user?.id ? selectedConversation.tenant : selectedConversation.owner)
    : null;

  return (
    <>
      {/* Floating Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0, rotate: 180 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-gradient-to-r from-primary-500 via-purple-500 to-pink-500 text-white shadow-2xl shadow-primary-500/30 flex items-center justify-center z-50 group"
          >
            {/* Glow effect */}
            <motion.div
              className="absolute inset-0 rounded-full bg-gradient-to-r from-primary-500 via-purple-500 to-pink-500"
              animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
            <MessageCircle className="w-6 h-6 relative z-10 group-hover:scale-110 transition-transform" />
            {unreadCount > 0 && <PulseBadge count={unreadCount} />}
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className={`fixed bottom-6 right-6 bg-white rounded-2xl shadow-2xl overflow-hidden z-50 flex flex-col ${
              isExpanded ? 'w-[420px] h-[600px]' : 'w-[360px] h-[500px]'
            }`}
            style={{ maxHeight: 'calc(100vh - 100px)' }}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-primary-600 via-purple-600 to-pink-600 p-4 text-white relative overflow-hidden">
              {/* Animated background pattern */}
              <motion.div
                className="absolute inset-0 opacity-10"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M20 20.5V18H0v-2h20v-2.5l5 3.5-5 3.5z'/%3E%3C/g%3E%3C/svg%3E")`,
                }}
                animate={{ x: [0, -40] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
              />

              <div className="flex items-center justify-between relative z-10">
                <div className="flex items-center gap-3">
                  {selectedConversation ? (
                    <>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={handleBack}
                        className="p-1 hover:bg-white/20 rounded-lg transition-colors"
                      >
                        <ChevronLeft className="w-5 h-5" />
                      </motion.button>
                      <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-sm font-semibold">
                        {otherUser?.firstName[0]}{otherUser?.lastName[0]}
                      </div>
                      <div>
                        <p className="font-semibold text-sm">{otherUser?.firstName} {otherUser?.lastName}</p>
                        <p className="text-xs text-white/70 flex items-center gap-1">
                          <Home className="w-3 h-3" />
                          {selectedConversation.property.title}
                        </p>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="p-2 bg-white/20 rounded-xl">
                        <MessageCircle className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-semibold flex items-center gap-2">
                          Messages
                          <Sparkles className="w-4 h-4" />
                        </p>
                        <p className="text-xs text-white/70">{conversations.length} conversations</p>
                      </div>
                    </>
                  )}
                </div>

                <div className="flex items-center gap-1">
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                  >
                    {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setIsOpen(false)}
                    className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </motion.button>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-hidden flex flex-col">
              {selectedConversation ? (
                <>
                  {/* Messages Area */}
                  <div className="flex-1 overflow-y-auto p-4 bg-gradient-to-b from-gray-50 to-white">
                    {isLoading ? (
                      <div className="flex items-center justify-center h-full">
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                          className="w-8 h-8 border-3 border-primary-500 border-t-transparent rounded-full"
                        />
                      </div>
                    ) : messages.length === 0 ? (
                      <div className="flex flex-col items-center justify-center h-full text-gray-400">
                        <MessageCircle className="w-12 h-12 mb-2 opacity-50" />
                        <p className="text-sm">Start the conversation!</p>
                      </div>
                    ) : (
                      <>
                        {messages.map((message) => (
                          <MessageBubble
                            key={message.id}
                            message={message}
                            isMe={message.senderId === user?.id}
                          />
                        ))}
                        {isTyping && <TypingIndicator />}
                        <div ref={messagesEndRef} />
                      </>
                    )}
                  </div>

                  {/* Input Area */}
                  <form onSubmit={handleSendMessage} className="p-3 bg-white border-t">
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={newMessage}
                        onChange={handleTyping}
                        placeholder="Type a message..."
                        className="flex-1 px-4 py-2.5 bg-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/50 transition-all"
                      />
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        type="submit"
                        disabled={!newMessage.trim() || isSending}
                        className="p-2.5 bg-gradient-to-r from-primary-500 to-purple-500 text-white rounded-xl disabled:opacity-50 transition-all hover:shadow-lg hover:shadow-primary-500/30"
                      >
                        <Send className="w-4 h-4" />
                      </motion.button>
                    </div>
                  </form>
                </>
              ) : (
                <>
                  {/* Conversations List */}
                  <div className="flex-1 overflow-y-auto">
                    {conversations.length === 0 ? (
                      <div className="flex flex-col items-center justify-center h-full p-8 text-center">
                        <motion.div
                          animate={{ y: [0, -10, 0] }}
                          transition={{ duration: 2, repeat: Infinity }}
                          className="w-16 h-16 rounded-full bg-gradient-to-br from-primary-100 to-purple-100 flex items-center justify-center mb-4"
                        >
                          <MessageCircle className="w-8 h-8 text-primary-500" />
                        </motion.div>
                        <p className="text-gray-500 text-sm mb-4">No conversations yet</p>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => {
                            setIsOpen(false);
                            navigate('/properties');
                          }}
                          className="px-4 py-2 bg-gradient-to-r from-primary-500 to-purple-500 text-white text-sm rounded-lg"
                        >
                          Browse Properties
                        </motion.button>
                      </div>
                    ) : (
                      <div className="p-2 space-y-1">
                        {conversations.map((conv) => (
                          <ConversationItem
                            key={conv.id}
                            conversation={conv}
                            isSelected={false}
                            onClick={() => handleSelectConversation(conv)}
                            currentUserId={user?.id || ''}
                          />
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Footer */}
                  <div className="p-3 border-t bg-gray-50">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleOpenFullMessages}
                      className="w-full py-2.5 text-sm text-primary-600 font-medium hover:bg-primary-50 rounded-xl transition-colors flex items-center justify-center gap-2"
                    >
                      <Maximize2 className="w-4 h-4" />
                      Open Full Messages
                    </motion.button>
                  </div>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default FloatingChatWidget;
