"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/AuthContext";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs, getDoc, doc, orderBy, limit } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, MessageCircle } from "lucide-react";
import { Header } from "@/components/Header";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface Chat {
  id: string;
  participants: string[];
  itemId: string;
  itemType: "lost" | "found";
  lastMessage?: string;
  lastMessageTime?: any;
}

interface User {
  name: string;
}

export default function ChatsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [chats, setChats] = useState<Chat[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userCache, setUserCache] = useState<Map<string, User>>(new Map());

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to view your chats.",
        variant: "destructive",
      });
      router.push("/login");
      return;
    }

    const fetchChats = async () => {
      try {
        const chatsQuery = query(
          collection(db, "chats"),
          where("participants", "array-contains", user.uid)
        );
        const chatsSnapshot = await getDocs(chatsQuery);
        const chatsData: Chat[] = [];
        const userIdsToFetch = new Set<string>();

        for (const chatDoc of chatsSnapshot.docs) {
          const chatData = { id: chatDoc.id, ...chatDoc.data() } as Chat;
          chatsData.push(chatData);
          const otherParticipant = chatData.participants.find((uid) => uid !== user.uid);
          if (otherParticipant && !userCache.has(otherParticipant)) {
            userIdsToFetch.add(otherParticipant);
          }

          // Fetch last message
          const messagesQuery = query(
            collection(db, "chats", chatDoc.id, "messages"),
            orderBy("timestamp", "desc"),
            limit(1)
          );
          const messagesSnapshot = await getDocs(messagesQuery);
          if (!messagesSnapshot.empty) {
            const lastMessage = messagesSnapshot.docs[0].data();
            chatData.lastMessage = lastMessage.text;
            chatData.lastMessageTime = lastMessage.timestamp;
          }
        }

        // Fetch names for other participants
        const userPromises = Array.from(userIdsToFetch).map(async (uid) => {
          try {
            const userDoc = await getDoc(doc(db, "users", uid));
            if (!userDoc.exists()) {
              console.warn(`User document not found for UID: ${uid}`);
              return { uid, data: { name: `User_${uid.slice(0, 8)}` } };
            }
            const userData = userDoc.data();
            if (!userData.name) {
              console.warn(`Name missing for UID: ${uid}`, userData);
              return { uid, data: { name: `User_${uid.slice(0, 8)}` } };
            }
            return { uid, data: { name: userData.name } as User };
          } catch (error: any) {
            console.error(`Error fetching user ${uid}:`, error.message);
            return { uid, data: { name: `User_${uid.slice(0, 8)}` } };
          }
        });
        const userResults = await Promise.all(userPromises);
        const newUserCache = new Map(userCache);
        userResults.forEach(({ uid, data }) => newUserCache.set(uid, data));
        setUserCache(newUserCache);

        setChats(chatsData);
      } catch (error: any) {
        toast({
          title: "Error",
          description: "Failed to load chats.",
          variant: "destructive",
        });
        console.error("Error fetching chats:", error.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchChats();
  }, [user, authLoading, router, toast, userCache]);

  const handleChatClick = (chatId: string) => {
    router.push(`/chat/${chatId}`);
  };

  if (isLoading || authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <>
      <Header />
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <h1 className="mb-8 text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white">
          Your Conversations
        </h1>
        {chats.length === 0 ? (
          <div className="text-center text-lg text-gray-500 dark:text-gray-400 animate-fade-in">
            No chats yet. Start a conversation from the search page!
          </div>
        ) : (
          <div className="space-y-4 animate-fade-in">
            {chats.map((chat, index) => {
              const otherParticipant = chat.participants.find((uid) => uid !== user?.uid);
              const name = otherParticipant
                ? userCache.get(otherParticipant)?.name || `User_${otherParticipant.slice(0, 8)}`
                : "Unknown";
              return (
                <Card
                  key={chat.id}
                  className="group bg-white dark:bg-gray-800 shadow-lg hover:shadow-xl transition-all duration-300 ease-in-out transform hover:-translate-y-1 cursor-pointer border-l-4 border-primary/20 hover:border-primary"
                  style={{ animationDelay: `${index * 100}ms` }}
                  onClick={() => handleChatClick(chat.id)}
                >
                  <CardHeader className="flex flex-row items-center gap-4 p-4">
                    <Avatar className="h-12 w-12 ring-2 ring-primary/10 group-hover:ring-primary transition-all">
                      <AvatarImage src="/images/avatar.png" alt={name} />
                      <AvatarFallback className="text-lg font-semibold">
                        {name[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <CardTitle className="text-xl font-semibold text-gray-900 dark:text-white">
                        {name}
                      </CardTitle>
                      <p className="text-sm text-gray-500 dark:text-gray-400 capitalize">
                        {chat.itemType} Item
                      </p>
                    </div>
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    <p className="text-sm text-gray-600 dark:text-gray-300 truncate">
                      {chat.lastMessage || "No messages yet"}
                    </p>
                    {chat.lastMessageTime && (
                      <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                        {chat.lastMessageTime.toDate().toLocaleString()}
                      </p>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </main>
    </>
  );
}