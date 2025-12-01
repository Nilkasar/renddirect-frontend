import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { chatAPI } from '../../lib/api';
import { Conversation } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { LoadingSpinner, BackButton } from '../../components/Common';
import ChatWindow from './ChatWindow';
import { MessageSquare, Home, User } from 'lucide-react';
import toast from 'react-hot-toast';

const Messages: React.FC = () => {
  const { conversationId } = useParams<{ conversationId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);

  useEffect(() => {
    fetchConversations();
  }, []);

  useEffect(() => {
    if (conversationId && conversations.length > 0) {
      const conv = conversations.find((c) => c.id === conversationId);
      if (conv) {
        setSelectedConversation(conv);
      } else {
        // Fetch the specific conversation
        fetchConversation(conversationId);
      }
    }
  }, [conversationId, conversations]);

  const fetchConversations = async () => {
    try {
      const response = await chatAPI.getConversations();
      if (response.data.success) {
        setConversations(response.data.data);
      }
    } catch (error) {
      toast.error('Failed to load conversations');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchConversation = async (id: string) => {
    try {
      const response = await chatAPI.getConversation(id);
      if (response.data.success) {
        setSelectedConversation(response.data.data);
      }
    } catch (error) {
      toast.error('Conversation not found');
      navigate('/messages');
    }
  };

  // Safe date formatting with fallback for invalid dates
  const formatTime = (dateString: string | undefined | null): string => {
    if (!dateString) return '';
    try {
      const d = new Date(dateString);
      // Check if date is valid
      if (isNaN(d.getTime())) return '';

      const now = new Date();
      const diffDays = Math.floor((now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24));

      if (diffDays === 0) {
        return d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
      } else if (diffDays === 1) {
        return 'Yesterday';
      } else if (diffDays < 7) {
        return d.toLocaleDateString('en-IN', { weekday: 'short' });
      } else {
        return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
      }
    } catch {
      return '';
    }
  };

  const getOtherUser = (conv: Conversation) => {
    return user?.role === 'OWNER' ? conv.tenant : conv.owner;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <div className="flex h-[calc(100vh-4rem)]">
          {/* Conversation List */}
          <div
            className={`w-full md:w-96 bg-white border-r flex flex-col ${
              selectedConversation ? 'hidden md:flex' : 'flex'
            }`}
          >
            <div className="p-4 border-b">
              <div className="flex items-center gap-3">
                <BackButton fallbackPath="/" label="" className="md:hidden" />
                <h1 className="text-xl font-bold text-gray-900">Messages</h1>
              </div>
            </div>

            {conversations.length === 0 ? (
              <div className="flex-1 flex items-center justify-center p-8 text-center">
                <div>
                  <MessageSquare className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No messages yet</h3>
                  <p className="text-gray-500 mb-4">
                    {user?.role === 'OWNER'
                      ? 'Tenants will message you when interested in your properties'
                      : 'Start a conversation by contacting a property owner'}
                  </p>
                  {user?.role === 'TENANT' && (
                    <Link to="/properties" className="btn-primary">
                      Browse Properties
                    </Link>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto">
                {conversations.map((conv) => {
                  const otherUser = getOtherUser(conv);
                  const isSelected = selectedConversation?.id === conv.id;
                  const lastMessage = conv.messages?.[0];

                  return (
                    <Link
                      key={conv.id}
                      to={`/messages/${conv.id}`}
                      className={`block p-4 border-b hover:bg-gray-50 transition-colors ${
                        isSelected ? 'bg-primary-50' : ''
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        {/* Avatar */}
                        <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <User className="h-6 w-6 text-primary-600" />
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-semibold text-gray-900 truncate">
                              {otherUser.firstName} {otherUser.lastName}
                            </span>
                            {conv.lastMessageAt && (
                              <span className="text-xs text-gray-500">
                                {formatTime(conv.lastMessageAt)}
                              </span>
                            )}
                          </div>

                          {/* Property Title */}
                          <div className="flex items-center gap-1 text-sm text-primary-600 mb-1">
                            <Home className="h-3 w-3" />
                            <span className="truncate">{conv.property.title}</span>
                          </div>

                          {/* Last Message Preview */}
                          {lastMessage && (
                            <p className="text-sm text-gray-500 truncate">
                              {lastMessage.content}
                            </p>
                          )}

                          {/* Deal Status */}
                          {conv.deal && (
                            <span
                              className={`mt-1 inline-block text-xs px-2 py-0.5 rounded-full ${
                                conv.deal.status === 'COMPLETED'
                                  ? 'bg-green-100 text-green-700'
                                  : 'bg-yellow-100 text-yellow-700'
                              }`}
                            >
                              {conv.deal.status === 'COMPLETED' ? 'Deal Completed' : 'Deal Pending'}
                            </span>
                          )}
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>

          {/* Chat Window */}
          <div
            className={`flex-1 flex flex-col ${
              selectedConversation ? 'flex' : 'hidden md:flex'
            }`}
          >
            {selectedConversation ? (
              <ChatWindow
                conversation={selectedConversation}
                onBack={() => {
                  setSelectedConversation(null);
                  navigate('/messages');
                }}
              />
            ) : (
              <div className="flex-1 flex items-center justify-center bg-gray-100">
                <div className="text-center text-gray-500">
                  <MessageSquare className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                  <p>Select a conversation to start messaging</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Messages;
