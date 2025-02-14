'use client'
//IMports
import React, { useState, useEffect } from 'react';
import { useUser } from "@clerk/nextjs";
import { Conversation } from '@prisma/client';
import UserTypeSelector from './components/UserTypeSelector';
import ConversationList from './components/ConversationList';
import MessageArea from './components/MessageArea';
import { getConversation, createMessage, createConversation } from '@/app/actions/conversations';

const MessageInterface = ({ conversations }: { conversations: Conversation[] }) => {
  const { user } = useUser();
  const [userType, setUserType] = useState<'Landlord' | 'Tenant'>('Landlord');
  const [allConversations, setAllConversations] = useState<Conversation[]>(conversations);
  const [selectedConversationIndex, setSelectedConversationIndex] = useState<number | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [sseMessages, setSseMessages] = useState<any[]>([]);

  const baseUrl = process.env.NEXT_PUBLIC_GO_SERVER_URL
  const url = `${baseUrl}/events?id=${user?.id}`

  useEffect(() => {
    const fetchConversation = async () => {
      if (selectedConversationIndex !== null) {
        const conversation = allConversations[selectedConversationIndex];
        const fullConversation = await getConversation(conversation.id);
        setMessages(fullConversation?.messages || []);
      } else {
        setMessages([]);
      }
    };

    fetchConversation();
  }, [selectedConversationIndex, allConversations]);

  useEffect(() => {
    if (!user?.id) return;

    //const eventSource = new EventSource(`/api/sse?id=${user.id}`);
    const eventSource = new EventSource(url);

    eventSource.onmessage = (event) => {
      console.log(event)
      if (event.data.trim() === ': keepalive') {
        // Ignore heartbeat messages
        return;
      }

      const message = JSON.parse(event.data);
      setSseMessages((prevMessages) => [...prevMessages, message]);
      setAllConversations((prevConversations) => {
        const updatedConversations = [...prevConversations];
        const index = updatedConversations.findIndex(conv => conv.id === message.conversationId);
        if (index !== -1) {
          updatedConversations[index].messages = [...updatedConversations[index].messages, message];
        }
        return updatedConversations;
      });
    };

    return () => {
      eventSource.close();
    };
  }, [user]);

  const handleSelectConversation = (index: number) => {
    setSelectedConversationIndex(index);
  };

  const handleSendMessage = async (newMessageInput: string, imgUrl?: string) => {
    if (selectedConversationIndex === null || !newMessageInput.trim()) return;

    const selectedConversation = allConversations[selectedConversationIndex];
    let receiverId: string;
    if (user?.id === selectedConversation?.participant1Id) {
      receiverId = selectedConversation?.participant2Id;
    } else {
      receiverId = selectedConversation?.participant1Id;
    }

    const messageData = {
      content: newMessageInput,
      senderRole: userType,
      conversationId: selectedConversation.id,
      receiverId: receiverId
    };

    if (imgUrl) {
      messageData.imgUrl = imgUrl;
    }

    const newMessage = await createMessage(messageData);

    setMessages([...messages, newMessage]);
  };

  const handleCreateConversation = async (email: string) => {
    if (!email.trim()) return;
    try {
      const newConversation = await createConversation(email);
      setAllConversations([...allConversations, newConversation]);
    } catch (error) {
      console.error('Failed to create conversation:', error);
      // TODO: Handle error (e.g., show an error message to the user)
    }
  };

  if (!user) return null;
  return (
    <div className="flex flex-col">
      {url}
      <UserTypeSelector userType={userType} setUserType={setUserType} />
      <div onClick={() => console.log(conversations)} >{sseMessages.length}</div>
      <div className="flex flex-1 overflow-hidden">
        <ConversationList
          conversations={allConversations}
          onSelectConversation={handleSelectConversation}
          onCreateConversation={handleCreateConversation}
          user={user}
        />
        <MessageArea
          selectedConversation={selectedConversationIndex !== null ? allConversations[selectedConversationIndex] : null}
          messages={messages}
          onSendMessage={handleSendMessage}
          currentUserId={user?.id}
        />
      </div>
    </div>
  );
};

export default MessageInterface;
