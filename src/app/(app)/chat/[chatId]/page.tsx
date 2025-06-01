"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAuth } from "@/lib/AuthContext";
import { db } from "@/lib/firebase";
import { collection, query, orderBy, getDoc, doc, addDoc, onSnapshot } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Send, Image as ImageIcon, X } from "lucide-react";
import { Header } from "@/components/Header";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { sendMessageNotification } from "@/app/actions/notificationActions";

interface Message {
  id?: string;
  text?: string;
  image?: string;
  senderId?: string;
  timestamp?: any;
}

interface UserData {
  name?: string;
}

export default function ChatPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [otherParticipantName, setOtherParticipantName] = useState("Unknown");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const chatId = typeof params?.chatId === "string" ? params.chatId : null;

  useEffect(() => {
    if (authLoading || !user || !chatId) {
      if (!authLoading && !user) {
        toast({
          title: "Authentication Required",
          description: "Please log in to view this chat.",
          variant: "destructive",
          className: "dark:bg-red-600"
        });
        router.push("/login");
      } else if (!chatId) {
        toast({
          title: "Invalid Chat",
          description: "Chat ID is missing.",
          variant: "destructive",
          className: "dark:bg-red-600"
        });
        router.push("/chats");
      }
      return;
    }

    const fetchChat = async () => {
      try {
        const chatDoc = await getDoc(doc(db, "chats", chatId));
        if (!chatDoc.exists()) {
          toast({
            title: "Error",
            description: "Chat not found.",
            variant: "destructive",
            className: "dark:bg-red-600"
          });
          router.push("/chats");
          return;
        }

        const chatData = chatDoc.data();
        const otherParticipant = chatData.participants.find((uid: string) => uid !== user.uid);
        if (otherParticipant) {
          const userDoc = await getDoc(doc(db, "users", otherParticipant));
          setOtherParticipantName(
            userDoc.exists()
              ? userDoc.data().name || `User_${otherParticipant.slice(0, 8)}`
              : `User_${otherParticipant.slice(0, 8)}`
          );
        }

        const messagesQuery = query(
          collection(db, "chats", chatId, "messages"),
          orderBy("timestamp", "asc")
        );
        const unsubscribe = onSnapshot(messagesQuery, (snapshot) => {
          const messagesData: Message[] = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          } as Message));
          setMessages(messagesData);
          setIsLoading(false);
        });

        return () => unsubscribe();
      } catch (error: any) {
        toast({
          title: "Error",
          description: "Failed to load chat.",
          variant: "destructive",
          className: "dark:bg-red-600"
        });
        console.error("Error fetching chat:", error.message);
        setIsLoading(false);
      }
    };

    fetchChat();
  }, [user, authLoading, chatId, router, toast]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        toast({
          title: "Invalid File",
          description: "Please upload an image file.",
          variant: "destructive",
          className: "dark:bg-red-600"
        });
        return;
      }
      if (file.size > 2 * 1024 * 1024) {
        toast({
          title: "File Too Large",
          description: "Image must be less than 2MB.",
          variant: "destructive",
          className: "dark:bg-red-600"
        });
        return;
      }
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const convertToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() && !imageFile) return;
    if (!chatId || !user) return;

    try {
      const messageData: Message = {
        senderId: user.uid,
        timestamp: new Date(),
      };

      if (newMessage.trim()) {
        messageData.text = newMessage;
      }

      if (imageFile) {
        const base64Image = await convertToBase64(imageFile);
        messageData.image = base64Image;
      }

      await addDoc(collection(db, "chats", chatId, "messages"), messageData);

      const notificationResponse = await sendMessageNotification(
        chatId,
        user.uid,
        newMessage || "Image message",
        imageFile ? "image" : undefined
      );
      if (!notificationResponse.success) {
        console.warn("Notification failed:", notificationResponse.message);
        toast({
          title: "Notification Error",
          description: `Message sent, but email notification failed: ${notificationResponse.message}`,
          variant: "destructive",
          className: "dark:bg-red-600"
        });
      }

      setNewMessage("");
      setImageFile(null);
      setImagePreview(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to send message.",
        variant: "destructive",
        className: "dark:bg-red-600"
      });
      console.error("Error sending message:", error.message);
    }
  };

  if (isLoading || authLoading || !user || !chatId) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        <Loader2 className="h-12 w-12 animate-spin text-teal-500" />
      </div>
    );
  }

  return (
    <>
      <Header />
      <main className="container mx-auto px-4 py-8 max-w-3xl min-h-screen flex flex-col bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        <div className="flex items-center gap-3 mb-6 animate-fade-in">
          <Avatar className="h-10 w-10 ring-2 ring-teal-500/20">
            <AvatarImage src="/images/avatar.png" alt={otherParticipantName} />
            <AvatarFallback>{otherParticipantName[0]}</AvatarFallback>
          </Avatar>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Chat with {otherParticipantName}
          </h1>
        </div>
        <div className="flex-1 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 overflow-y-auto max-h-[calc(100vh-200px)] animate-fade-in">
          {messages.length === 0 ? (
            <div className="text-center text-gray-500 dark:text-gray-400">
              No messages yet. Start the conversation!
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.senderId === user?.uid ? "justify-end" : "justify-start"} animate-slide-in`}
                >
                  <div
                    className={`max-w-[70%] p-3 rounded-lg shadow-md ${message.senderId === user?.uid
                      ? "bg-teal-500 text-white rounded-br-none"
                      : "bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white rounded-bl-none"
                    }`}
                  >
                    {message.image && (
                      <img
                        src={message.image}
                        alt="Chat image"
                        className="max-w-full h-auto rounded-md mb-2"
                        style={{ maxHeight: "200px" }}
                      />
                    )}
                    {message.text && <p className="text-sm">{message.text}</p>}
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                      {message.timestamp?.toDate().toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>
        <div className="mt-4">
          {imagePreview && (
            <div className="relative max-w-[150px] mb-4 animate-fade-in">
              <img
                src={imagePreview}
                alt="Image preview"
                className="w-full h-auto rounded-lg border-2 border-teal-500 dark:border-teal-400"
              />
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-0 right-0 bg-gray-800/80 text-white rounded-full hover:bg-gray-700"
                onClick={removeImage}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}
          <form
            onSubmit={handleSendMessage}
            className="flex items-center gap-2 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md sticky bottom-0 animate-fade-in"
          >
            <Input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
              ref={fileInputRef}
            />
            <Button
              type="button"
              variant="ghost"
              onClick={() => fileInputRef.current?.click()}
              className="text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-700"
            >
              <ImageIcon className="h-5 w-5" />
            </Button>
            <Input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type your message..."
              className="flex-1 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white border-none focus:ring-2 focus:ring-teal-500"
            />
            <Button type="submit" className="bg-teal-500 hover:bg-teal-600">
              <Send className="h-5 w-5" />
            </Button>
          </form>
        </div>
      </main>
    </>
  );
}