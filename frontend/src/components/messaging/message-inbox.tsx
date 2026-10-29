"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  MessageCircle, 
  Send, 
  Reply, 
  Clock, 
  Search,
  Filter,
  MoreVertical,
  Archive,
  Star,
  StarOff
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Sample message data - in a real app, this would come from an API
const sampleMessages = [
  {
    id: 1,
    customerName: "Priya Sharma",
    customerEmail: "priya.sharma@email.com",
    customerAvatar: "https://images.unsplash.com/photo-1494790108755-2616b4e2d81d?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80",
    artworkId: 1,
    artworkName: "Hand-Painted Madhubani Art",
    subject: "Question about painting techniques",
    message: "Hi! I'm really interested in this beautiful Madhubani painting. Could you tell me more about the specific techniques you used? Also, would it be possible to create a custom piece with similar patterns but in different colors?",
    timestamp: "2024-01-15T10:30:00Z",
    status: "unread",
    starred: false,
    thread: [
      {
        id: 1,
        sender: "customer",
        message: "Hi! I'm really interested in this beautiful Madhubani painting. Could you tell me more about the specific techniques you used? Also, would it be possible to create a custom piece with similar patterns but in different colors?",
        timestamp: "2024-01-15T10:30:00Z"
      }
    ]
  },
  {
    id: 2,
    customerName: "Rajesh Kumar",
    customerEmail: "rajesh.kumar@email.com",
    customerAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80",
    artworkId: 1,
    artworkName: "Hand-Painted Madhubani Art",
    subject: "Shipping inquiry",
    message: "Hello, I wanted to know about shipping options to Delhi. Also, can you provide a certificate of authenticity with this artwork?",
    timestamp: "2024-01-14T15:45:00Z",
    status: "read",
    starred: true,
    thread: [
      {
        id: 1,
        sender: "customer",
        message: "Hello, I wanted to know about shipping options to Delhi. Also, can you provide a certificate of authenticity with this artwork?",
        timestamp: "2024-01-14T15:45:00Z"
      },
      {
        id: 2,
        sender: "artisan",
        message: "Hello Rajesh! Yes, we provide free shipping to Delhi and it usually takes 5-7 business days. Every artwork comes with a signed certificate of authenticity. Would you like me to send you more details about the piece?",
        timestamp: "2024-01-14T16:30:00Z"
      },
      {
        id: 3,
        sender: "customer",
        message: "That sounds perfect! Could you also tell me about the care instructions for the painting?",
        timestamp: "2024-01-14T17:15:00Z"
      }
    ]
  },
  {
    id: 3,
    customerName: "Anita Desai",
    customerEmail: "anita.desai@email.com",
    customerAvatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80",
    artworkId: 2,
    artworkName: "Blue Pottery Decorative Bowl",
    subject: "Custom order inquiry",
    message: "I love your blue pottery work! I'm planning a wedding and would like to order 20 similar bowls as gifts. Is this possible and what would be the timeline?",
    timestamp: "2024-01-13T09:20:00Z",
    status: "unread",
    starred: false,
    thread: [
      {
        id: 1,
        sender: "customer",
        message: "I love your blue pottery work! I'm planning a wedding and would like to order 20 similar bowls as gifts. Is this possible and what would be the timeline?",
        timestamp: "2024-01-13T09:20:00Z"
      }
    ]
  },
  {
    id: 4,
    customerName: "Vikram Singh",
    customerEmail: "vikram.singh@email.com",
    customerAvatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80",
    artworkId: 1,
    artworkName: "Hand-Painted Madhubani Art",
    subject: "Artwork dimensions",
    message: "Could you please confirm the exact dimensions of this piece? I want to make sure it fits perfectly in my living room.",
    timestamp: "2024-01-12T14:10:00Z",
    status: "read",
    starred: false,
    thread: [
      {
        id: 1,
        sender: "customer",
        message: "Could you please confirm the exact dimensions of this piece? I want to make sure it fits perfectly in my living room.",
        timestamp: "2024-01-12T14:10:00Z"
      },
      {
        id: 2,
        sender: "artisan",
        message: "The painting measures exactly 16 inches by 12 inches. It's painted on handmade paper and comes unframed, so you can choose a frame that matches your decor perfectly.",
        timestamp: "2024-01-12T15:30:00Z"
      }
    ]
  }
];

interface MessageInboxProps {
  className?: string;
}

export default function MessageInbox({ className }: MessageInboxProps) {
  const [selectedMessage, setSelectedMessage] = useState(sampleMessages[0]);
  const [replyText, setReplyText] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [isReplyDialogOpen, setIsReplyDialogOpen] = useState(false);

  const filteredMessages = sampleMessages.filter(message => {
    const matchesSearch = message.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         message.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         message.artworkName.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesFilter = filterStatus === "all" || 
                         (filterStatus === "unread" && message.status === "unread") ||
                         (filterStatus === "starred" && message.starred);
    
    return matchesSearch && matchesFilter;
  });

  const unreadCount = sampleMessages.filter(msg => msg.status === "unread").length;
  const starredCount = sampleMessages.filter(msg => msg.starred).length;

  const handleSendReply = () => {
    if (!replyText.trim()) return;

    // Here you would send the reply to your backend
    console.log("Sending reply:", {
      messageId: selectedMessage.id,
      reply: replyText,
      timestamp: new Date().toISOString()
    });

    // Update the local thread (in a real app, this would be handled by your state management)
    const newReply = {
      id: selectedMessage.thread.length + 1,
      sender: "artisan" as const,
      message: replyText,
      timestamp: new Date().toISOString()
    };

    // Update the selected message thread
    setSelectedMessage(prev => ({
      ...prev,
      thread: [...prev.thread, newReply],
      status: "read"
    }));

    setReplyText("");
    setIsReplyDialogOpen(false);
  };

  const toggleStar = (messageId: number) => {
    // Update starred status (in a real app, this would update your backend)
    console.log("Toggling star for message:", messageId);
  };

  const markAsRead = (messageId: number) => {
    // Mark message as read (in a real app, this would update your backend)
    console.log("Marking message as read:", messageId);
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return "Just now";
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 48) return "Yesterday";
    return date.toLocaleDateString();
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageCircle className="h-5 w-5" />
          Message Inbox
          {unreadCount > 0 && (
            <Badge className="bg-orange-600 text-white">
              {unreadCount} new
            </Badge>
          )}
        </CardTitle>
        <CardDescription>
          Communicate directly with customers about your artwork
        </CardDescription>
      </CardHeader>

      <CardContent>
        <Tabs defaultValue="all" className="w-full">
          <div className="flex items-center justify-between mb-4">
            <TabsList>
              <TabsTrigger value="all" onClick={() => setFilterStatus("all")}>
                All ({sampleMessages.length})
              </TabsTrigger>
              <TabsTrigger value="unread" onClick={() => setFilterStatus("unread")}>
                Unread ({unreadCount})
              </TabsTrigger>
              <TabsTrigger value="starred" onClick={() => setFilterStatus("starred")}>
                Starred ({starredCount})
              </TabsTrigger>
            </TabsList>

            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search messages..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 w-64"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Messages List */}
            <div className="lg:col-span-1 space-y-3">
              {filteredMessages.length === 0 ? (
                <div className="text-center py-8">
                  <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No messages found</p>
                </div>
              ) : (
                filteredMessages.map((message) => (
                  <div
                    key={message.id}
                    onClick={() => {
                      setSelectedMessage(message);
                      if (message.status === "unread") {
                        markAsRead(message.id);
                      }
                    }}
                    className={`p-4 border rounded-lg cursor-pointer transition-colors hover:bg-gray-50 ${
                      selectedMessage.id === message.id ? "border-orange-300 bg-orange-50" : ""
                    } ${message.status === "unread" ? "border-l-4 border-l-orange-600" : ""}`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={message.customerAvatar} alt={message.customerName} />
                          <AvatarFallback>{message.customerName.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className={`text-sm ${message.status === "unread" ? "font-semibold" : "font-medium"}`}>
                            {message.customerName}
                          </p>
                          <p className="text-xs text-gray-500">{message.artworkName}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleStar(message.id);
                          }}
                        >
                          {message.starred ? (
                            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                          ) : (
                            <StarOff className="h-3 w-3 text-gray-400" />
                          )}
                        </Button>
                        <span className="text-xs text-gray-500">
                          {formatTimestamp(message.timestamp)}
                        </span>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 font-medium mb-1">{message.subject}</p>
                    <p className="text-xs text-gray-500 line-clamp-2">{message.message}</p>
                  </div>
                ))
              )}
            </div>

            {/* Message Thread */}
            <div className="lg:col-span-2">
              {selectedMessage && (
                <div className="border rounded-lg">
                  <div className="p-4 border-b bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarImage src={selectedMessage.customerAvatar} alt={selectedMessage.customerName} />
                          <AvatarFallback>{selectedMessage.customerName.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className="font-semibold">{selectedMessage.customerName}</h3>
                          <p className="text-sm text-gray-600">{selectedMessage.customerEmail}</p>
                          <p className="text-xs text-orange-600">Re: {selectedMessage.artworkName}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{selectedMessage.subject}</Badge>
                        <Dialog open={isReplyDialogOpen} onOpenChange={setIsReplyDialogOpen}>
                          <DialogTrigger asChild>
                            <Button size="sm" className="bg-orange-600 hover:bg-orange-700">
                              <Reply className="h-4 w-4 mr-2" />
                              Reply
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Reply to {selectedMessage.customerName}</DialogTitle>
                              <DialogDescription>
                                Replying about: {selectedMessage.artworkName}
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                              <Textarea
                                placeholder="Type your reply here..."
                                value={replyText}
                                onChange={(e) => setReplyText(e.target.value)}
                                rows={6}
                              />
                            </div>
                            <DialogFooter>
                              <Button variant="outline" onClick={() => setIsReplyDialogOpen(false)}>
                                Cancel
                              </Button>
                              <Button onClick={handleSendReply} className="bg-orange-600 hover:bg-orange-700">
                                <Send className="h-4 w-4 mr-2" />
                                Send Reply
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 max-h-96 overflow-y-auto">
                    <div className="space-y-4">
                      {selectedMessage.thread.map((threadMessage) => (
                        <div
                          key={threadMessage.id}
                          className={`flex ${threadMessage.sender === "artisan" ? "justify-end" : "justify-start"}`}
                        >
                          <div
                            className={`max-w-xs lg:max-w-md px-4 py-3 rounded-lg ${
                              threadMessage.sender === "artisan"
                                ? "bg-orange-600 text-white"
                                : "bg-gray-100 text-gray-800"
                            }`}
                          >
                            <p className="text-sm">{threadMessage.message}</p>
                            <p className={`text-xs mt-2 ${
                              threadMessage.sender === "artisan" ? "text-orange-100" : "text-gray-500"
                            }`}>
                              {formatTimestamp(threadMessage.timestamp)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </Tabs>
      </CardContent>
    </Card>
  );
}
