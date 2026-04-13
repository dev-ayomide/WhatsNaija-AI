'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { supabase, Conversation, Message } from '@/lib/supabase';
import { sendWhatsAppMessage, setConversationStatus } from '@/lib/api';
import { formatDistanceToNow } from 'date-fns';
import { MessageCircle, Bot, User, Send, Circle, UserCheck, RefreshCw, AlertCircle } from 'lucide-react';
import Button from '@/components/Button';
import Input from '@/components/Input';

export default function ConversationsPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState('');

  // Stable refs so polling closures always have latest values
  const businessIdRef = useRef<string | null>(null);
  const selectedConvoRef = useRef<Conversation | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    selectedConvoRef.current = selectedConversation;
  }, [selectedConversation]);

  // One-time: resolve the business ID for this user
  useEffect(() => {
    async function initBusiness() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data: biz } = await supabase
          .from('businesses').select('id').eq('owner_id', user.id).single();

        if (biz) {
          businessIdRef.current = biz.id;
          loadConversations(biz.id);
        }
      } catch (err) {
        console.error(err);
        setLoadError(true);
      } finally {
        setLoading(false);
      }
    }
    initBusiness();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadConversations = useCallback(async (bizId?: string) => {
    const id = bizId || businessIdRef.current;
    if (!id) return;
    try {
      const { data } = await supabase
        .from('conversations')
        .select('*')
        .eq('business_id', id)
        .order('last_message_at', { ascending: false });

      const convos = data || [];
      setConversations(convos);
      setLoadError(false);

      // Auto-select first conversation only on initial load
      if (!selectedConvoRef.current && convos.length > 0) {
        setSelectedConversation(convos[0]);
      }

      // Keep selected conversation data fresh (status may have changed)
      if (selectedConvoRef.current) {
        const updated = convos.find((c) => c.id === selectedConvoRef.current!.id);
        if (updated) setSelectedConversation(updated);
      }
    } catch (err) {
      console.error('Error loading conversations:', err);
      setLoadError(true);
    }
  }, []);

  const loadMessages = useCallback(async (conversationId: string) => {
    try {
      const { data } = await supabase
        .from('messages').select('*')
        .eq('conversation_id', conversationId)
        .order('sent_at', { ascending: true });

      setMessages(data || []);
    } catch (err) {
      console.error('Error loading messages:', err);
    }
  }, []);

  // Load messages when selected conversation changes
  useEffect(() => {
    if (selectedConversation) loadMessages(selectedConversation.id);
  }, [selectedConversation?.id, loadMessages]);

  // Poll every 4 seconds
  useEffect(() => {
    const poll = setInterval(() => {
      loadConversations();
      if (selectedConvoRef.current) loadMessages(selectedConvoRef.current.id);
    }, 4000);
    return () => clearInterval(poll);
  }, [loadConversations, loadMessages]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function sendMessage() {
    if (!newMessage.trim() || !selectedConversation || sending) return;

    const text = newMessage.trim();
    setNewMessage('');
    setSending(true);
    setSendError('');

    try {
      await sendWhatsAppMessage(
        selectedConversation.business_id,
        selectedConversation.customer_phone,
        text,
        selectedConversation.id,
      );
      loadMessages(selectedConversation.id);
    } catch (err) {
      console.error('Error sending message:', err);
      setSendError('Failed to send. Please try again.');
      setNewMessage(text);
    } finally {
      setSending(false);
    }
  }

  async function handleSetStatus(status: 'bot' | 'human') {
    if (!selectedConversation) return;
    try {
      await setConversationStatus(selectedConversation.id, status);
      setSelectedConversation({ ...selectedConversation, status });
      setConversations((prev) =>
        prev.map((c) => c.id === selectedConversation.id ? { ...c, status } : c)
      );
    } catch (err) {
      console.error('Error updating status:', err);
    }
  }

  if (loading) {
    return (
      <div className="h-screen flex flex-col">
        <div className="px-8 py-6 bg-white border-b border-sand-200 animate-pulse">
          <div className="h-8 bg-sand-200 rounded-xl w-48" />
        </div>
        <div className="flex-1 flex">
          <div className="w-96 border-r border-sand-200 p-4 space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-sand-100 rounded-xl animate-pulse" />
            ))}
          </div>
          <div className="flex-1 bg-sand-50" />
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <div className="px-8 py-6 bg-white border-b border-sand-200 flex-shrink-0">
        <h1 className="font-display font-bold text-3xl text-sand-900">Conversations</h1>
        <p className="text-sand-400 text-sm mt-1">View and manage customer chats</p>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Conversations List */}
        <div className="w-96 bg-white border-r border-sand-200 overflow-y-auto flex-shrink-0">
          {loadError ? (
            <div className="p-8 text-center">
              <AlertCircle className="w-10 h-10 text-red-400 mx-auto mb-3" />
              <p className="font-semibold text-sand-700 text-sm mb-3">Failed to load conversations</p>
              <Button onClick={() => loadConversations()} variant="secondary" size="sm">
                Try again
              </Button>
            </div>
          ) : conversations.length === 0 ? (
            <div className="p-8 text-center">
              <MessageCircle className="w-12 h-12 text-sand-300 mx-auto mb-3" />
              <p className="font-semibold text-sand-600 text-sm">No conversations yet</p>
              <p className="text-xs text-sand-400 mt-1">
                Conversations appear here when customers message your WhatsApp number
              </p>
            </div>
          ) : (
            <div className="divide-y divide-sand-100">
              {conversations.map((conversation) => (
                <button
                  key={conversation.id}
                  onClick={() => setSelectedConversation(conversation)}
                  className={`w-full p-4 text-left hover:bg-sand-50 transition-colors ${
                    selectedConversation?.id === conversation.id ? 'bg-earth-50 border-l-2 border-earth-500' : ''
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <p className="font-semibold text-sand-900 text-sm truncate">
                      {conversation.customer_name || conversation.customer_phone}
                    </p>
                    <StatusBadge status={conversation.status} />
                  </div>
                  <p className="text-xs text-sand-400">
                    {formatDistanceToNow(new Date(conversation.last_message_at), { addSuffix: true })}
                  </p>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Chat View */}
        {selectedConversation ? (
          <div className="flex-1 flex flex-col bg-sand-50 min-w-0">
            {/* Chat Header */}
            <div className="px-6 py-4 bg-white border-b border-sand-200 flex-shrink-0">
              <div className="flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <h2 className="font-semibold text-sand-900 truncate">
                    {selectedConversation.customer_name || selectedConversation.customer_phone}
                  </h2>
                  <p className="text-xs text-sand-400 mt-0.5">{selectedConversation.customer_phone}</p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <StatusBadge status={selectedConversation.status} />
                  {selectedConversation.status === 'bot' ? (
                    <Button onClick={() => handleSetStatus('human')} variant="secondary" size="sm">
                      <UserCheck className="w-4 h-4" />
                      Take Over
                    </Button>
                  ) : (
                    <Button onClick={() => handleSetStatus('bot')} variant="secondary" size="sm">
                      <Bot className="w-4 h-4" />
                      Hand Back to Bot
                    </Button>
                  )}
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {messages.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-sm text-sand-400">No messages yet</p>
                </div>
              )}
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.role === 'customer' ? 'justify-start' : 'justify-end'}`}
                >
                  <div className={`max-w-sm lg:max-w-md rounded-2xl px-4 py-3 ${
                    message.role === 'customer'
                      ? 'bg-white border border-sand-200'
                      : message.role === 'bot'
                      ? 'bg-earth-100 border border-earth-200'
                      : 'bg-earth-500 text-white'
                  }`}>
                    <div className="flex items-center gap-1.5 mb-1">
                      {message.role === 'bot' && <Bot className="w-3.5 h-3.5 text-earth-600" />}
                      {message.role === 'owner' && <User className="w-3.5 h-3.5 text-white/80" />}
                      <span className={`text-xs font-semibold ${
                        message.role === 'owner' ? 'text-white/70' : 'text-sand-500'
                      }`}>
                        {message.role === 'customer' ? 'Customer' : message.role === 'bot' ? 'Bot' : 'You'}
                      </span>
                    </div>
                    <p className={`text-sm leading-relaxed ${message.role === 'owner' ? 'text-white' : 'text-sand-900'}`}>
                      {message.content}
                    </p>
                    <p className={`text-xs mt-1.5 ${message.role === 'owner' ? 'text-white/50' : 'text-sand-400'}`}>
                      {formatDistanceToNow(new Date(message.sent_at), { addSuffix: true })}
                    </p>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 bg-white border-t border-sand-200 flex-shrink-0">
              {sendError && (
                <p className="text-xs text-red-600 font-medium mb-2">{sendError}</p>
              )}
              <div className="flex gap-2.5">
                <Input
                  type="text"
                  placeholder={
                    selectedConversation.status === 'human'
                      ? 'Type your message…'
                      : 'Take over to reply manually…'
                  }
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                  className="flex-1"
                  disabled={sending}
                />
                <Button
                  onClick={sendMessage}
                  variant="primary"
                  size="md"
                  disabled={sending || !newMessage.trim()}
                >
                  {sending ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                </Button>
              </div>
              {selectedConversation.status === 'human' && (
                <p className="text-xs text-amber-600 font-medium mt-2">
                  You are replying manually. Bot won't respond until you hand back.
                </p>
              )}
            </div>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-sand-50">
            <div className="text-center">
              <MessageCircle className="w-16 h-16 text-sand-200 mx-auto mb-4" />
              <p className="font-semibold text-sand-400">Select a conversation</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const cfg: Record<string, { dot: string; label: string }> = {
    bot:    { dot: 'bg-forest-500', label: 'Bot' },
    human:  { dot: 'bg-amber-500',  label: 'Manual' },
    closed: { dot: 'bg-sand-400',   label: 'Closed' },
  };
  const { dot, label } = cfg[status] ?? cfg.bot;
  return (
    <span className="inline-flex items-center gap-1.5 px-2 py-1 bg-sand-100 rounded-lg text-xs font-semibold text-sand-700 whitespace-nowrap">
      <Circle className={`w-2 h-2 ${dot} fill-current`} />
      {label}
    </span>
  );
}
