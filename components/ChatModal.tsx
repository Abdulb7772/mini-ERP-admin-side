"use client";

import React, { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import axiosInstance from "@/services/axios";
import {
  initializeSocket,
  joinChat,
  leaveChat,
  sendMessage as socketSendMessage,
  startTyping,
  stopTyping,
  markMessagesAsRead,
  onNewMessage,
  onTypingUpdate,
  onMessagesRead,
  offNewMessage,
  offTypingUpdate,
  offMessagesRead,
  onChatUpdated,
  offChatUpdated,
} from "@/services/socketService";
import Button from "./Button";
import Input from "./Input";
import AttachmentSelector from "./AttachmentSelector";
import AttachmentDetailsModal from "./AttachmentDetailsModal";
import toast from "react-hot-toast";
import { confirmToast } from "@/utils/confirmToast";

interface Chat {
  _id: string;
  type: "internal" | "external";
  participants: Array<{ _id: string; name: string; email: string; role: string }>;
  isGroup: boolean;
  groupName?: string;
  department?: string;
  contextType?: string;
  contextId?: any;
  lastMessage?: string;
  lastMessageAt?: string;
  myUnreadCount?: number;
  unreadCount?: number;
}

interface Message {
  _id: string;
  chatId: string;
  senderId: string;
  senderRole: string;
  senderName: string;
  text: string;
  attachments: string[];
  contextType?: string;
  contextId?: any;
  status: string;
  readBy: string[];
  createdAt: string;
}

interface ChatModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ChatModal({ isOpen, onClose }: ChatModalProps) {
  const { data: session } = useSession();
  const [chats, setChats] = useState<Chat[]>([]);
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageText, setMessageText] = useState("");
  const [loading, setLoading] = useState(false);
  const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set());
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());
  const [activeTab, setActiveTab] = useState<"internal" | "external" | "teams" | "all">("all");
  const [staffMembers, setStaffMembers] = useState<any[]>([]);
  const [allUsers, setAllUsers] = useState<any[]>([]); // All staff members for internal tab
  const [teams, setTeams] = useState<any[]>([]); // Teams for teams tab
  const [showAttachMenu, setShowAttachMenu] = useState(false);
  const [contextType, setContextType] = useState<string | null>(null);
  const [contextId, setContextId] = useState<string | null>(null);
  const [attachmentSelectorOpen, setAttachmentSelectorOpen] = useState(false);
  const [attachmentType, setAttachmentType] = useState<"order" | "product" | "customer">("order");
  const [detailsModal, setDetailsModal] = useState<{ isOpen: boolean; type: string; data: any }>({
    isOpen: false,
    type: 'order',
    data: null
  });
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
  const [messageInfoModal, setMessageInfoModal] = useState<{ isOpen: boolean; message: Message | null }>({
    isOpen: false,
    message: null
  });
  const dropdownRef = useRef<HTMLDivElement>(null);
  const initializedRef = useRef(false);
  const selectedChatRef = useRef<Chat | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Keep ref in sync with state
  useEffect(() => {
    selectedChatRef.current = selectedChat;
  }, [selectedChat]);

  // Initialize Socket.IO
  useEffect(() => {
    if (session?.user?.accessToken && isOpen && !initializedRef.current) {
      initializedRef.current = true;
      initializeSocket(session.user.accessToken);

      const handleNewMessage = (data: { chatId: string; message: Message }) => {
        if (data.chatId === selectedChatRef.current?._id) {
          setMessages((prev) => [...prev, data.message]);
          markMessagesAsRead(data.chatId);
          setChats((prev) =>
            prev.map((chat) =>
              chat._id === data.chatId
                ? { ...chat, myUnreadCount: 0, unreadCount: 0 }
                : chat
            )
          );
        } else {
          setChats((prev) =>
            prev.map((chat) =>
              chat._id === data.chatId
                ? {
                    ...chat,
                    myUnreadCount: getUnreadCount(chat) + 1,
                    unreadCount: getUnreadCount(chat) + 1,
                  }
                : chat
            )
          );
        }
        // Update chat list
        fetchChats();
      };

      const handleTypingUpdate = (data: { chatId: string; userId: string; userName: string; isTyping: boolean }) => {
        if (data.chatId === selectedChatRef.current?._id && data.userId !== session.user.id) {
          setTypingUsers((prev) => {
            const newSet = new Set(prev);
            if (data.isTyping) {
              newSet.add(data.userName);
            } else {
              newSet.delete(data.userName);
            }
            return newSet;
          });
        }
      };

      const handleMessagesRead = (data: { chatId: string; userId: string }) => {
        if (data.chatId === selectedChatRef.current?._id) {
          setMessages((prev) =>
            prev.map((msg) => ({
              ...msg,
              status: msg.senderId === session.user.id ? "seen" : msg.status,
            }))
          );
        }
      };

      const handleChatUpdated = () => {
        fetchChats();
      };

      // Set up socket listeners
      onNewMessage(handleNewMessage);
      onTypingUpdate(handleTypingUpdate);
      onMessagesRead(handleMessagesRead);
      onChatUpdated(handleChatUpdated);

      return () => {
        offNewMessage(handleNewMessage);
        offTypingUpdate(handleTypingUpdate);
        offMessagesRead(handleMessagesRead);
        offChatUpdated(handleChatUpdated);
        initializedRef.current = false;
      };
    }
  }, [session?.user?.accessToken, session?.user?.id, isOpen]);

  // Fetch chats
  const fetchChats = async () => {
    try {
      const params: any = {};
      if (activeTab === "external" || activeTab === "internal") {
        params.type = activeTab;
      } else if (activeTab === "teams") {
        // For teams tab, fetch internal group chats
        params.type = "internal";
        params.isGroup = true;
      }
      const response = await axiosInstance.get("/chats", { params });
      setChats(response.data?.data || response.data || []);
    } catch (error: any) {
      console.error("Error fetching chats:", JSON.stringify(error, null, 2));
      const errorDetails = {
        message: error?.message || 'Unknown error',
        status: error?.status,
        success: error?.success,
        error: error?.error
      };
      console.error("Error details:", JSON.stringify(errorDetails, null, 2));
      // Don't show error for empty chats
      if (error?.status !== 404) {
        setChats([]);
      }
    }
  };

  const getUnreadCount = (chat: Chat) => {
    if (typeof chat?.myUnreadCount === "number") return chat.myUnreadCount;
    if (typeof chat?.unreadCount === "number") return chat.unreadCount;
    return 0;
  };

  const formatChatListTime = (chat: Chat) => {
    const timeValue = chat.lastMessageAt;

    if (!timeValue) return "";

    return new Date(timeValue).toLocaleTimeString([], {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  useEffect(() => {
    if (isOpen) {
      fetchChats();
      if (activeTab === "internal") {
        fetchStaffMembers();
      } else if (activeTab === "teams") {
        fetchTeams();
      }
    }
  }, [isOpen, activeTab]);

  // Merge staff with chats when either changes (for internal tab)
  useEffect(() => {
    if (activeTab === "internal" && staffMembers.length > 0) {
      mergeStaffWithChats(staffMembers);
    } else if (activeTab === "teams" && teams.length > 0) {
      mergeTeamsWithChats(teams);
    }
  }, [chats, staffMembers, teams, activeTab]);

  // Fetch staff members for internal chat
  const fetchStaffMembers = async () => {
    try {
      const response = await axiosInstance.get("/chats/staff");
      const staff = response.data.data || [];
      setStaffMembers(staff);
      
      // Merge staff with existing chats for internal tab
      if (activeTab === "internal") {
        mergeStaffWithChats(staff);
      }
    } catch (error: any) {
      console.error("Error fetching staff:", JSON.stringify(error, null, 2));
      console.error("Error details:", {
        message: error?.message || 'Unknown error',
        status: error?.status,
        success: error?.success
      });
    }
  };

  // Merge staff members with existing chats
  const mergeStaffWithChats = (staff: any[]) => {
    const merged = staff.map((user: any) => {
      // Find existing chat with this user
      const existingChat = chats.find((chat) => 
        !chat.isGroup && chat.participants.some((p) => p._id === user._id)
      );

      if (existingChat) {
        return existingChat;
      }

      // Return user as potential chat
      return {
        _id: `user-${user._id}`,
        type: "internal" as const,
        participants: [user],
        isGroup: false,
        lastMessage: "",
        lastMessageAt: null,
        myUnreadCount: 0,
        isPotential: true, // Flag to indicate this is not an existing chat
      };
    });

    setAllUsers(merged);
  };

  // Fetch teams
  const fetchTeams = async () => {
    try {
      const response = await axiosInstance.get("/teams");
      const teamsData = response.data.data || [];
      setTeams(teamsData);
      
      if (activeTab === "teams") {
        mergeTeamsWithChats(teamsData);
      }
    } catch (error: any) {
      console.error("Error fetching teams:", JSON.stringify(error, null, 2));
      console.error("Error details:", {
        message: error?.message || 'Unknown error',
        status: error?.status,
        success: error?.success
      });
    }
  };

  // Merge teams with existing chats
  const mergeTeamsWithChats = (teamsData: any[]) => {
    // Filter only active teams
    const activeTeams = teamsData.filter((team: any) => team.isActive !== false);
    
    const merged = activeTeams.map((team: any) => {
      // Find existing group chat for this team
      const existingChat = chats.find((chat) => 
        chat.isGroup && chat.groupName === team.name
      );

      if (existingChat) {
        return existingChat;
      }

      // Return team as potential group chat
      return {
        _id: `team-${team._id}`,
        type: "internal" as const,
        participants: team.members || [],
        isGroup: true,
        groupName: team.name,
        department: team.description,
        lastMessage: "",
        lastMessageAt: null,
        myUnreadCount: 0,
        isPotentialTeam: true, // Flag to indicate this is a team without existing chat
        teamId: team._id, // Store team ID for creating the group chat
      };
    });

    setAllUsers(merged);
  };

  // Select chat
  const handleSelectChat = async (chat: any) => {
    const previousChatId = selectedChatRef.current?._id;

    if (previousChatId && previousChatId !== chat._id) {
      leaveChat(previousChatId);
    }

    // If this is a potential team (team without existing chat), create group chat
    if (chat.isPotentialTeam) {
      setLoading(true);
      try {
        const participantIds = chat.participants.map((p: any) => p._id);
        const requestData: any = {
          groupName: chat.groupName,
          participantIds: participantIds,
          department: chat.department,
        };
        
        const response = await axiosInstance.post("/chats/group", requestData);
        const newChat = response.data.data;
        setSelectedChat(newChat);
        setMessages([]);
        
        // Join chat room
        joinChat(newChat._id);
        
        // Refresh lists
        fetchChats();
        if (activeTab === "teams") {
          fetchTeams();
        }
      } catch (error: any) {
        console.error("Error creating team chat:", JSON.stringify(error, null, 2));
        console.error("Error details:", {
          message: error?.message || 'Unknown error',
          status: error?.status,
          success: error?.success
        });
      } finally {
        setLoading(false);
      }
      return;
    }
    
    // If this is a potential chat (user without existing chat), create it first
    if (chat.isPotential) {
      setLoading(true);
      try {
        const participantId = chat.participants[0]._id;
        const requestData: any = {
          participantId,
          type: "internal",
        };
        
        // Add context if available
        if (contextType && contextId) {
          requestData.contextType = contextType;
          requestData.contextId = contextId;
        }
        
        const response = await axiosInstance.post("/chats/create", requestData);
        const newChat = response.data.data;
        setSelectedChat(newChat);
        setMessages([]);
        
        // Clear context after creating chat
        setContextType(null);
        setContextId(null);
        
        // Join chat room
        joinChat(newChat._id);
        
        // Refresh lists
        fetchChats();
        if (activeTab === "internal") {
          fetchStaffMembers();
        }
      } catch (error: any) {
        console.error("Error creating chat:", JSON.stringify(error, null, 2));
        console.error("Error details:", {
          message: error?.message || 'Unknown error',
          status: error?.status,
          success: error?.success
        });
      } finally {
        setLoading(false);
      }
      return;
    }

    setSelectedChat(chat);
    setMessages([]);
    setLoading(true);

    try {
      // Join chat room
      joinChat(chat._id);

      // Fetch messages
      const response = await axiosInstance.get(`/chats/${chat._id}/messages`);
      setMessages(response.data.data.messages || []);

      // Mark as read
      await axiosInstance.patch(`/chats/${chat._id}/read`);
      markMessagesAsRead(chat._id);
      setChats((prev) =>
        prev.map((item) =>
          item._id === chat._id
            ? { ...item, myUnreadCount: 0, unreadCount: 0 }
            : item
        )
      );

      // Update chat list
      fetchChats();
    } catch (error: any) {
      console.error("Error loading chat:", JSON.stringify(error, null, 2));
      console.error("Error details:", {
        message: error?.message || 'Unknown error',
        status: error?.status,
        success: error?.success
      });
    } finally {
      setLoading(false);
    }
  };

  // Send message
  const handleSendMessage = async () => {
    if (!messageText.trim() || !selectedChat) return;

    const text = messageText;
    const attachData: any = {};
    
    // Include context if it was set
    if (contextType && contextId) {
      attachData.contextType = contextType;
      attachData.contextId = contextId;
    }
    
    setMessageText("");
    setContextType(null);
    setContextId(null);

    // Stop typing indicator
    stopTyping(selectedChat._id);

    // Send via Socket.IO
    socketSendMessage({
      chatId: selectedChat._id,
      text,
      ...attachData,
    });
  };

  // Handle typing
  const handleTyping = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMessageText(e.target.value);

    if (!selectedChat) return;

    // Start typing indicator
    startTyping(selectedChat._id);

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Stop typing after 2 seconds of inactivity
    typingTimeoutRef.current = setTimeout(() => {
      stopTyping(selectedChat._id);
    }, 2000);
  };

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Leave chat on unmount
  useEffect(() => {
    return () => {
      if (selectedChatRef.current?._id) {
        leaveChat(selectedChatRef.current._id);
      }
    };
  }, []);

  const handleAttachmentSelect = (id: string) => {
    setContextType(attachmentType);
    setContextId(id);
    setShowAttachMenu(false);
  };

  const handleDeleteMessage = async (messageId: string) => {
    confirmToast({
      title: "Delete Message",
      message: "Are you sure you want to delete this message?",
      onConfirm: async () => {
        try {
          await axiosInstance.delete(`/chats/messages/${messageId}`);
          setMessages((prev) => prev.filter((msg) => msg._id !== messageId));
          setOpenDropdownId(null);
          toast.success("Message deleted successfully");
        } catch (error) {
          console.error("Error deleting message:", error);
          toast.error("Failed to delete message. Please try again.");
        }
      },
    });
  };

  const handleDeleteChat = (chatId: string, event: React.MouseEvent) => {
    event.stopPropagation();

    confirmToast({
      title: "Delete Chat",
      message: "Are you sure you want to delete this chat? This action cannot be undone.",
      onConfirm: async () => {
        try {
          await axiosInstance.delete(`/chats/${chatId}`);

          setChats((prev) => prev.filter((chat) => chat._id !== chatId));
          setAllUsers((prev) => prev.filter((chat: any) => chat._id !== chatId));

          if (selectedChatRef.current?._id === chatId) {
            leaveChat(chatId);
            setSelectedChat(null);
            setMessages([]);
          }

          toast.success("Chat deleted successfully");
        } catch (error) {
          console.error("Error deleting chat:", error);
          toast.error("Failed to delete chat. Please try again.");
        }
      },
    });
  };

  const handleShowMessageInfo = (message: Message) => {
    setMessageInfoModal({ isOpen: true, message });
    setOpenDropdownId(null);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpenDropdownId(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-md bg-black/40 p-0 sm:p-4">
      <div className="bg-linear-to-br from-white via-gray-50 to-blue-50 rounded-none sm:rounded-2xl shadow-2xl w-full h-full sm:h-[85vh] sm:max-w-6xl flex flex-col border border-white/50">
        {/* Header */}
        <div className="flex items-center justify-between p-3 sm:p-5 bg-linear-to-r from-blue-600 via-purple-600 to-indigo-600 rounded-t-none sm:rounded-t-2xl">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-2 rounded-lg">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <h2 className="text-lg sm:text-2xl font-bold text-white">Messages</h2>
          </div>
          <button onClick={onClose} className="text-white hover:bg-white/20 p-2 rounded-lg transition-all duration-200 hover:rotate-90">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Chat List */}
          <div className={`${selectedChat ? 'hidden md:flex' : 'flex'} w-full md:w-1/3 border-r border-gray-200 flex-col bg-linear-to-b from-white to-gray-50`}>
            {/* Tabs */}
            <div className="flex gap-1 p-2 bg-white border-b border-gray-200">
              <button
                onClick={() => setActiveTab("all")}
                className={`flex-1 py-1.5 px-2 text-xs font-semibold rounded-lg transition-all duration-200 ${
                  activeTab === "all" 
                    ? "bg-linear-to-r from-blue-500 to-blue-600 text-white shadow-lg" 
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                }`}
              >
                <div className="flex items-center justify-center gap-1">
                  <span>💬</span>
                  All
                </div>
              </button>
              <button
                onClick={() => setActiveTab("internal")}
                className={`flex-1 py-1.5 px-2 text-xs font-semibold rounded-lg transition-all duration-200 ${
                  activeTab === "internal" 
                    ? "bg-linear-to-r from-green-500 to-emerald-600 text-white shadow-lg" 
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                }`}
              >
                <div className="flex items-center justify-center gap-1">
                  <span>💬</span>
                  Internal
                </div>
              </button>
              <button
                onClick={() => setActiveTab("teams")}
                className={`flex-1 py-1.5 px-2 text-xs font-semibold rounded-lg transition-all duration-200 ${
                  activeTab === "teams" 
                    ? "bg-linear-to-r from-orange-500 to-amber-600 text-white shadow-lg" 
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                }`}
              >
                <div className="flex items-center justify-center gap-1">
                  <span>👥</span>
                  Teams
                </div>
              </button>
              <button
                onClick={() => setActiveTab("external")}
                className={`flex-1 py-1.5 px-2 text-xs font-semibold rounded-lg transition-all duration-200 ${
                  activeTab === "external" 
                    ? "bg-linear-to-r from-purple-500 to-pink-600 text-white shadow-lg" 
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                }`}
              >
                <div className="flex items-center justify-center gap-1">
                  <span>🌐</span>
                  Clients
                </div>
              </button>
            </div>

            {/* Chats/Users List */}
            <div className="flex-1 overflow-y-auto">
              {(activeTab === "internal" || activeTab === "teams" ? allUsers : chats).length === 0 ? (
                <div className="flex items-center justify-center h-full text-gray-500 p-4 text-center">
                  <div>
                    <p className="text-lg mb-2">💬</p>
                    <p className="text-sm">
                      {activeTab === "internal" 
                        ? "No staff members found" 
                        : activeTab === "external"
                        ? "No client conversations yet"
                        : activeTab === "teams"
                        ? "No team chats yet"
                        : "No conversations yet"}
                    </p>
                  </div>
                </div>
              ) : (
                <>
                  {(activeTab === "internal" || activeTab === "teams" ? allUsers : chats).map((chat) => (
                    <div
                      key={chat._id}
                      onClick={() => handleSelectChat(chat)}
                      className={`relative group p-4 border-b border-gray-100 cursor-pointer transition-all duration-200 ${
                        selectedChat?._id === chat._id 
                          ? "bg-white shadow-md scale-[1.02] border-l-4 border-l-blue-500" 
                          : "hover:bg-white hover:shadow-sm"
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="relative">
                            <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg ${
                              chat.isGroup 
                                ? "bg-linear-to-br from-orange-500 via-amber-500 to-yellow-600" 
                                : "bg-linear-to-br from-purple-500 via-pink-500 to-indigo-600"
                            }`}>
                              {chat.isGroup ? (
                                <span className="text-2xl">👥</span>
                              ) : (
                                (chat.participants.find((p: any) => p._id !== session?.user?.id)?.name?.[0] ?? "U").toUpperCase()
                              )}
                            </div>
                            {!chat.isGroup && (
                              <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 rounded-full border-2 border-white"></div>
                            )}
                          </div>
                          <div className="flex-1">
                            <h3 className="font-bold text-gray-900">
                              {chat.isGroup
                                ? chat.groupName
                                : (chat.participants.find((p: any) => p._id !== session?.user?.id)?.name ?? "Unknown")}
                            </h3>
                            <p className="text-xs text-gray-500 font-medium">
                              {chat.isGroup
                                ? `${chat.participants.length} members`
                                : (chat.participants.find((p: any) => p._id !== session?.user?.id)?.role ?? "")}
                            </p>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          <div className="flex items-center gap-1.5">
                            <span className={`text-white text-xs font-bold rounded-full px-2.5 py-1 ${getUnreadCount(chat) > 0 ? "bg-red-500" : "bg-black"}`}>
                              {getUnreadCount(chat)}
                            </span>

                            {!chat.isPotential && !chat.isPotentialTeam && (
                              <button
                                onClick={(event) => handleDeleteChat(chat._id, event)}
                                className="p-1.5 text-gray-500 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all"
                                title="Delete chat"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                            )}
                          </div>

                          {formatChatListTime(chat) && (
                            <span className="text-xs text-gray-500">{formatChatListTime(chat)}</span>
                          )}
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 truncate ml-15 mt-2">
                        {chat.lastMessage || (chat.isPotential || chat.isPotentialTeam ? "✨ Start a conversation" : "No messages yet")}
                      </p>
                      {chat.isPotentialTeam && chat.participants && (
                        <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full mt-2 inline-block ml-15 font-semibold">
                          👥 {chat.participants.length} member{chat.participants.length !== 1 ? 's' : ''}
                        </span>
                      )}
                      {chat.contextType && chat.contextType !== "general" && (
                        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full mt-2 inline-block ml-15 font-semibold">
                          📎 {chat.contextType}: {chat.contextId?.orderNumber || chat.contextId?.name || "N/A"}
                        </span>
                      )}

                    </div>
                  ))}
                </>
              )}
            </div>
          </div>

          {/* Chat Area */}
          <div className={`${selectedChat ? 'flex' : 'hidden md:flex'} flex-1 flex-col bg-white`}>
            {selectedChat ? (
              <>
                {/* Chat Header */}
                <div className="p-3 sm:p-5 border-b border-gray-200 bg-linear-to-r from-gray-50 to-white">
                  <div className="flex items-center gap-3">
                    {/* Back button for mobile */}
                    <button
                      onClick={() => setSelectedChat(null)}
                      className="md:hidden text-gray-600 hover:text-gray-900 p-2 hover:bg-gray-100 rounded-lg"
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-linear-to-br from-blue-500 via-purple-500 to-pink-600 flex items-center justify-center text-white font-bold text-base sm:text-lg shadow-lg shrink-0">
                      {((selectedChat.isGroup
                        ? selectedChat.groupName?.[0]
                        : selectedChat.participants.find((p) => p._id !== session?.user?.id)?.name?.[0]) || "U"
                      ).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-gray-900 text-base sm:text-lg truncate">
                        {selectedChat.isGroup
                          ? selectedChat.groupName
                          : (selectedChat.participants.find((p) => p._id !== session?.user?.id)?.name ?? "Unknown")}
                      </h3>
                      <p className="text-xs sm:text-sm text-gray-500 flex items-center gap-2">
                        <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                        {selectedChat.isGroup
                          ? `${selectedChat.participants.length} members`
                          : (selectedChat.participants.find((p) => p._id !== session?.user?.id)?.role ?? "Active now")}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-3 sm:p-6 space-y-4 bg-linear-to-b from-gray-50 to-white">
                  {loading ? (
                    <div className="flex items-center justify-center h-full">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                    </div>
                  ) : (
                    <>
                      {messages.map((message) => (
                        <div
                          key={message._id}
                          className={`flex ${
                            message.senderId === session?.user?.id ? "justify-end" : "justify-start"
                          }`}
                        >
                          <div className="relative group">
                            <div
                              className={`min-w-50 max-w-[70%] rounded-2xl p-4 shadow-md wrap-break-words ${
                                message.senderId === session?.user?.id
                                  ? "bg-linear-to-br from-purple-500 to-pink-600 text-white"
                                  : "bg-white border border-gray-200 text-gray-900"
                              }`}
                            >
                              {message.senderId !== session?.user?.id && (
                                <p className="text-xs font-semibold mb-1 wrap-break-word">{message.senderName}</p>
                              )}
                              <p className="text-sm wrap-break-word">{message.text}</p>
                              {message.contextType && message.contextId && (
                                <div 
                                  className={`mt-2 p-2 rounded-lg border cursor-pointer hover:opacity-80 transition ${
                                    message.senderId === session?.user?.id
                                      ? "bg-purple-400 border-purple-300"
                                      : "bg-gray-100 border-gray-300"
                                  }`}
                                  onClick={() => setDetailsModal({ 
                                    isOpen: true, 
                                    type: message.contextType!, 
                                    data: message.contextId 
                                  })}
                                >
                                  <p className="text-xs font-semibold flex items-center gap-1">
                                    📎 Attached {message.contextType}
                                  </p>
                                  <p className="text-xs mt-1">
                                    {message.contextType === "order" && `Order #${message.contextId?.orderNumber || message.contextId}`}
                                    {message.contextType === "product" && `${message.contextId?.name || message.contextId}`}
                                    {message.contextType === "customer" && `${message.contextId?.name || message.contextId}`}
                                  </p>
                                </div>
                              )}
                              <p className="text-xs mt-1 opacity-70">
                                {new Date(message.createdAt).toLocaleTimeString([], {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                                {message.senderId === session?.user?.id && (
                                  <span className="ml-2">
                                    {message.status === "seen" ? "✓✓" : message.status === "delivered" ? "✓✓" : "✓"}
                                  </span>
                                )}
                              </p>
                            </div>
                            
                            {/* Dropdown button */}
                            <button
                              onClick={() => setOpenDropdownId(openDropdownId === message._id ? null : message._id)}
                              className="absolute top-2 -right-7.5 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-lg hover:bg-gray-200"
                              title="Message options"
                            >
                              <svg className="w-5 h-5 text-gray-600" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/>
                              </svg>
                            </button>

                            {/* Dropdown menu */}
                            {openDropdownId === message._id && (
                              <div
                                ref={dropdownRef}
                                className={`absolute top-10 ${
                                  message.senderId === session?.user?.id ? "-left-7.5" : "-right-7.5"
                                } bg-white border border-gray-200 rounded-lg shadow-lg py-1 min-w-37.5 z-50`}
                              >
                                <button
                                  onClick={() => handleShowMessageInfo(message)}
                                  className="w-full text-left px-4 py-2 hover:bg-gray-50 text-sm flex items-center gap-2 text-gray-700"
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                  </svg>
                                  Info
                                </button>
                                {message.senderId === session?.user?.id && (
                                  <button
                                    onClick={() => handleDeleteMessage(message._id)}
                                    className="w-full text-left px-4 py-2 hover:bg-red-50 text-sm flex items-center gap-2 text-red-600"
                                  >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                    Delete
                                  </button>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                      {typingUsers.size > 0 && (
                        <div className="flex justify-start">
                          <div className="bg-gray-200 rounded-lg p-3">
                            <p className="text-sm text-gray-600">
                              {Array.from(typingUsers).join(", ")} typing...
                            </p>
                          </div>
                        </div>
                      )}
                      <div ref={messagesEndRef} />
                    </>
                  )}
                </div>

                {/* Message Input */}
                <div className="p-3 sm:p-5 border-t border-gray-200 bg-linear-to-r from-white to-gray-50">
                  {contextType && (
                    <div className="mb-2 flex items-center gap-2 text-sm">
                      <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full">
                        📎 Attached: {contextType}
                      </span>
                      <button
                        onClick={() => {
                          setContextType(null);
                          setContextId(null);
                        }}
                        className="text-red-500 hover:text-red-700"
                      >
                        ✕
                      </button>
                    </div>
                  )}
                  <div className="flex gap-2 items-end">
                    <div className="relative">
                      <button
                        onClick={() => setShowAttachMenu(!showAttachMenu)}
                        className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                        title="Attach context"
                      >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                        </svg>
                      </button>
                      {showAttachMenu && (
                        <div className="absolute bottom-full mb-2 left-0 bg-white border rounded-lg shadow-lg py-2 min-w-45 z-10">
                          <button
                            onClick={() => {
                              setAttachmentType("order");
                              setAttachmentSelectorOpen(true);
                              setShowAttachMenu(false);
                            }}
                            className="w-full text-left px-4 py-2 hover:bg-gray-50 text-sm flex items-center gap-2 text-gray-900"
                          >
                            <span>📦</span> Attach Order
                          </button>
                          <button
                            onClick={() => {
                              setAttachmentType("product");
                              setAttachmentSelectorOpen(true);
                              setShowAttachMenu(false);
                            }}
                            className="w-full text-left px-4 py-2 hover:bg-gray-50 text-sm flex items-center gap-2 text-gray-900"
                          >
                            <span>🛍️</span> Attach Product
                          </button>
                          <button
                            onClick={() => {
                              setAttachmentType("customer");
                              setAttachmentSelectorOpen(true);
                              setShowAttachMenu(false);
                            }}
                            className="w-full text-left px-4 py-2 hover:bg-gray-50 text-sm flex items-center gap-2 text-gray-900"
                          >
                            <span>👤</span> Attach Customer
                          </button>
                        </div>
                      )}
                    </div>
                    <input
                      type="text"
                      value={messageText}
                      onChange={handleTyping}
                      onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                      placeholder="Type a message..."
                      className="flex-1 min-w-0 border border-gray-300 rounded-lg px-3 sm:px-4 py-2 sm:py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white shadow-sm text-gray-900 placeholder-gray-400 text-sm sm:text-base"
                    />
                    <button
                      onClick={handleSendMessage}
                      disabled={!messageText.trim()}
                      className="bg-linear-to-r from-blue-600 to-purple-600 text-white rounded-lg px-4 sm:px-8 py-2 sm:py-3 hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-bold shadow-lg hover:shadow-xl hover:scale-105 text-sm sm:text-base shrink-0"
                    >
                      <span className="flex items-center gap-1 sm:gap-2">
                        <span className="hidden sm:inline">Send</span>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                        </svg>
                      </span>
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex items-center justify-center h-full bg-linear-to-br from-gray-50 to-blue-50">
                <div className="text-center">
                  <div className="text-6xl mb-4">💬</div>
                  <h3 className="text-2xl font-bold text-gray-700 mb-2">Start a Conversation</h3>
                  <p className="text-gray-500">Select a chat from the list to begin messaging</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Attachment Selector Modal */}
      <AttachmentSelector
        isOpen={attachmentSelectorOpen}
        onClose={() => setAttachmentSelectorOpen(false)}
        type={attachmentType}
        onSelect={handleAttachmentSelect}
      />
      
      {/* Attachment Details Modal */}
      <AttachmentDetailsModal
        isOpen={detailsModal.isOpen}
        onClose={() => setDetailsModal({ ...detailsModal, isOpen: false })}
        type={detailsModal.type as "order" | "product" | "customer"}
        data={detailsModal.data}
      />
      
      {/* Message Info Modal */}
      {messageInfoModal.isOpen && messageInfoModal.message && (
        <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-black/40 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-4 sm:p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900">Message Info</h3>
              <button
                onClick={() => setMessageInfoModal({ isOpen: false, message: null })}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="border-b pb-3">
                <p className="text-sm text-gray-500 mb-1">Message</p>
                <p className="text-gray-900">{messageInfoModal.message.text}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Sender</p>
                  <p className="text-gray-900 font-medium">{messageInfoModal.message.senderName}</p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-500 mb-1">Status</p>
                  <p className="text-gray-900 font-medium capitalize">
                    {messageInfoModal.message.status === "seen" ? (
                      <span className="flex items-center gap-1 text-blue-600">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/>
                        </svg>
                        Seen
                      </span>
                    ) : messageInfoModal.message.status === "delivered" ? (
                      <span className="flex items-center gap-1 text-green-600">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/>
                        </svg>
                        Delivered
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-gray-600">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                        </svg>
                        Sent
                      </span>
                    )}
                  </p>
                </div>
              </div>
              
              <div>
                <p className="text-sm text-gray-500 mb-1">Sent at</p>
                <p className="text-gray-900">
                  {new Date(messageInfoModal.message.createdAt).toLocaleString()}
                </p>
              </div>
              
              {messageInfoModal.message.readBy && messageInfoModal.message.readBy.length > 0 && (
                <div>
                  <p className="text-sm text-gray-500 mb-1">Read by</p>
                  <p className="text-gray-900">{messageInfoModal.message.readBy.length} participant(s)</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
