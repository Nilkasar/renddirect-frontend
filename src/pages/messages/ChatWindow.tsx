import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { chatAPI, dealsAPI } from '../../lib/api';
import { Conversation, Message } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import { LoadingSpinner } from '../../components/Common';
import {
  ChevronLeft, Send, Home, Phone, CheckCircle, User
} from 'lucide-react';
import toast from 'react-hot-toast';

interface ChatWindowProps {
  conversation: Conversation;
  onBack: () => void;
}

const ChatWindow: React.FC<ChatWindowProps> = ({ conversation, onBack }) => {
  const { user } = useAuth();
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

  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newMessage, setNewMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [deal, setDeal] = useState(conversation.deal || null);
  const [isConfirmingDeal, setIsConfirmingDeal] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const isOwner = user?.role === 'OWNER';
  const otherUser = isOwner ? conversation.tenant : conversation.owner;

  useEffect(() => {
    // Join conversation room
    joinConversation(conversation.id);

    // Fetch messages
    fetchMessages();

    // Fetch deal status
    fetchDeal();

    // Mark messages as read
    markAsRead(conversation.id);

    return () => {
      leaveConversation(conversation.id);
    };
  }, [conversation.id]);

  useEffect(() => {
    // Listen for new messages
    const unsubscribe = onNewMessage((message: Message) => {
      if (message.conversationId === conversation.id) {
        setMessages((prev) => [...prev, message]);
        scrollToBottom();
        markAsRead(conversation.id);
      }
    });

    return unsubscribe;
  }, [conversation.id, onNewMessage]);

  useEffect(() => {
    // Listen for typing indicators
    const unsubTypingStart = onTypingStart(({ conversationId, userId }) => {
      if (conversationId === conversation.id && userId !== user?.id) {
        setIsTyping(true);
      }
    });

    const unsubTypingStop = onTypingStop(({ conversationId, userId }) => {
      if (conversationId === conversation.id && userId !== user?.id) {
        setIsTyping(false);
      }
    });

    return () => {
      if (typeof unsubTypingStart === 'function') unsubTypingStart();
      if (typeof unsubTypingStop === 'function') unsubTypingStop();
    };
  }, [conversation.id, onTypingStart, onTypingStop, user?.id]);

  const fetchMessages = async () => {
    try {
      const response = await chatAPI.getMessages(conversation.id);
      if (response.data.success) {
        setMessages(response.data.data.items);
        scrollToBottom();
      }
    } catch (error) {
      toast.error('Failed to load messages');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchDeal = async () => {
    try {
      const response = await dealsAPI.getByConversation(conversation.id);
      if (response.data.success && response.data.data) {
        setDeal(response.data.data);
      }
    } catch (error) {
      // No deal exists yet, which is fine
    }
  };

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || isSending) return;

    setIsSending(true);
    const messageContent = newMessage.trim();
    setNewMessage('');

    try {
      // Send via API (socket will broadcast to room)
      const response = await chatAPI.sendMessage(conversation.id, messageContent);
      if (response.data.success) {
        setMessages((prev) => [...prev, response.data.data]);
        scrollToBottom();
      }
    } catch (error) {
      toast.error('Failed to send message');
      setNewMessage(messageContent); // Restore message
    } finally {
      setIsSending(false);
    }
  };

  const handleTyping = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewMessage(e.target.value);

    // Emit typing start
    startTyping(conversation.id);

    // Clear previous timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Stop typing after 2 seconds of inactivity
    typingTimeoutRef.current = setTimeout(() => {
      stopTyping(conversation.id);
    }, 2000);
  };

  const handleConfirmDeal = async () => {
    setIsConfirmingDeal(true);
    try {
      const response = isOwner
        ? await dealsAPI.ownerConfirm(conversation.id, conversation.property.rentAmount)
        : await dealsAPI.tenantConfirm(conversation.id);

      if (response.data.success) {
        setDeal(response.data.data);
        toast.success(response.data.message || 'Deal confirmed!');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to confirm deal');
    } finally {
      setIsConfirmingDeal(false);
    }
  };

  // Safe date formatting with fallback for invalid dates
  const formatTime = (dateString: string | undefined | null): string => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      // Check if date is valid
      if (isNaN(date.getTime())) return '';
      return date.toLocaleTimeString('en-IN', {
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return '';
    }
  };

  // Safe date formatting with fallback for invalid dates
  const formatDate = (dateString: string | undefined | null): string => {
    if (!dateString) return 'Today';
    try {
      const date = new Date(dateString);
      // Check if date is valid
      if (isNaN(date.getTime())) return 'Today';
      return date.toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });
    } catch {
      return 'Today';
    }
  };

  const groupMessagesByDate = (messages: Message[]) => {
    const groups: { [date: string]: Message[] } = {};
    messages.forEach((msg) => {
      const date = formatDate(msg.createdAt);
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(msg);
    });
    return groups;
  };

  const messageGroups = groupMessagesByDate(messages);

  const canConfirmDeal = !deal || (
    (isOwner && !deal.ownerConfirmed) ||
    (!isOwner && !deal.tenantConfirmed)
  );

  const hasConfirmed = deal && (
    (isOwner && deal.ownerConfirmed) ||
    (!isOwner && deal.tenantConfirmed)
  );

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="flex items-center gap-4 p-4 border-b bg-white">
        <button
          onClick={onBack}
          className="md:hidden p-2 hover:bg-gray-100 rounded-lg"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>

        <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
          <User className="h-5 w-5 text-primary-600" />
        </div>

        <div className="flex-1">
          <h2 className="font-semibold text-gray-900">
            {otherUser.firstName} {otherUser.lastName}
          </h2>
          <Link
            to={`/properties/${conversation.propertyId}`}
            className="text-sm text-primary-600 hover:underline flex items-center gap-1"
          >
            <Home className="h-3 w-3" />
            {conversation.property.title}
          </Link>
        </div>

        {isOwner && conversation.phoneRevealed && conversation.owner.phone && (
          <a
            href={`tel:${conversation.owner.phone}`}
            className="p-2 hover:bg-gray-100 rounded-lg text-primary-600"
          >
            <Phone className="h-5 w-5" />
          </a>
        )}
      </div>

      {/* Deal Banner */}
      {deal?.status === 'COMPLETED' ? (
        <div className="bg-green-100 text-green-800 px-4 py-3 flex items-center justify-center gap-2">
          <CheckCircle className="h-5 w-5" />
          <span className="font-medium">Deal Completed!</span>
          <span className="text-sm">Success fee: ₹{deal.successFeeAmount}</span>
        </div>
      ) : (
        <div className="bg-gray-100 px-4 py-3 flex flex-wrap items-center justify-between gap-2">
          <div className="text-sm text-gray-600">
            {!deal ? (
              'Ready to close the deal? Both parties need to confirm.'
            ) : hasConfirmed ? (
              <span className="text-green-600 flex items-center gap-1">
                <CheckCircle className="h-4 w-4" />
                You've confirmed. Waiting for {isOwner ? 'tenant' : 'owner'}.
              </span>
            ) : (
              `${isOwner ? 'Tenant' : 'Owner'} has confirmed. Your turn!`
            )}
          </div>
          {canConfirmDeal && (
            <button
              onClick={handleConfirmDeal}
              disabled={isConfirmingDeal}
              className="btn-primary text-sm py-1.5"
            >
              {isConfirmingDeal ? 'Confirming...' : 'Confirm Deal'}
            </button>
          )}
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
        {isLoading ? (
          <div className="flex justify-center py-8">
            <LoadingSpinner />
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>No messages yet. Start the conversation!</p>
          </div>
        ) : (
          Object.entries(messageGroups).map(([date, msgs]) => (
            <div key={date}>
              <div className="text-center my-4">
                <span className="bg-gray-200 text-gray-600 text-xs px-3 py-1 rounded-full">
                  {date}
                </span>
              </div>
              {msgs.map((message) => {
                const isMe = message.senderId === user?.id;
                return (
                  <div
                    key={message.id}
                    className={`flex mb-3 ${isMe ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[75%] rounded-2xl px-4 py-2 ${
                        isMe
                          ? 'bg-primary-600 text-white rounded-br-sm'
                          : 'bg-white text-gray-900 rounded-bl-sm shadow-sm'
                      }`}
                    >
                      <p className="break-words">{message.content}</p>
                      <div
                        className={`text-xs mt-1 ${
                          isMe ? 'text-primary-200' : 'text-gray-400'
                        }`}
                      >
                        {formatTime(message.createdAt)}
                        {isMe && message.status === 'READ' && (
                          <span className="ml-1">✓✓</span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ))
        )}

        {isTyping && (
          <div className="flex justify-start mb-3">
            <div className="bg-white rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm">
              <div className="flex gap-1">
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSendMessage} className="p-4 border-t bg-white">
        <div className="flex gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={handleTyping}
            placeholder="Type a message..."
            className="flex-1 input"
            disabled={deal?.status === 'COMPLETED'}
          />
          <button
            type="submit"
            disabled={!newMessage.trim() || isSending || deal?.status === 'COMPLETED'}
            className="btn-primary px-4"
          >
            <Send className="h-5 w-5" />
          </button>
        </div>
      </form>
    </div>
  );
};

export default ChatWindow;
