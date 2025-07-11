import React, { useState, useRef, useEffect } from 'react';
import { Download } from 'lucide-react';
import Image from "next/image";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { FilePreview } from '@/components/ui/file-preview';
import { isImageFile, getImageWithFallback } from '@/lib/utils';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from '@/components/ui/button';
import MessageList from './MessageList';
import MessageInputArea from './MessageInputArea';
import ConversationHeader from './ConversationHeader';

interface MessageAreaProps {
  selectedConversation: any;
  messages: any[];
  onSendMessage: (message: string, attachments?: MessageFile[]) => void;
  currentUserId: string | undefined;
  currentUserImage?: string | null;
  onBack?: () => void;
  onTyping?: (isTyping: boolean) => void;
  isOtherUserTyping?: boolean;
  initialIsMobile?: boolean;
}

interface MessageFile {
  url: string;
  fileName?: string;
  fileKey?: string;
  fileType?: string;
  fileSize?: number;
}

const MessageArea: React.FC<MessageAreaProps> = ({
  selectedConversation,
  messages,
  onSendMessage,
  currentUserId,
  currentUserImage = "/placeholder-avatar.png",
  onBack,
  onTyping,
  isOtherUserTyping = false,
  initialIsMobile = false
}) => {
  const [selectedFile, setSelectedFile] = useState<MessageFile | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const [isExiting, setIsExiting] = useState(false);
  const [isMobile, setIsMobile] = useState(initialIsMobile);
  // Use safe initialization for window properties during server rendering
  const [viewportHeight, setViewportHeight] = useState<number>(0); // Initialize to 0
  const [initialHeight, setInitialHeight] = useState<number>(0); // Initialize to 0
  
  // Update heights when component mounts on client side
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setViewportHeight(window.innerHeight);
      setInitialHeight(window.innerHeight);
    }
  }, []);
  const containerRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLDivElement>(null);
  const [scrollAreaHeight, setScrollAreaHeight] = useState<string>('100%');
  
  // Detect if device is iOS - safe for SSR
  const isIOS = () => {
    if (typeof navigator === 'undefined') return false;
    return /iPhone|iPad|iPod/i.test(navigator.userAgent) || 
           (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  };

  useEffect(() => {
    // Skip during SSR
    if (typeof window === 'undefined') return;
    
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkIfMobile();

    window.addEventListener('resize', checkIfMobile);

    return () => {
      window.removeEventListener('resize', checkIfMobile);
    };
  }, []);

  // Handle visual viewport changes for keyboard management
  useEffect(() => {
    // Skip during SSR and if not mobile
    if (typeof window === 'undefined' || !isMobile) return;

    const handleViewportChange = () => {
      if (window.visualViewport) {
        const newHeight = window.visualViewport.height;
        setViewportHeight(newHeight);
      }
    };

    // Initial setup
    handleViewportChange();

    // Listen for viewport changes
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', handleViewportChange);
      window.visualViewport.addEventListener('scroll', handleViewportChange);
    }

    return () => {
      if (window.visualViewport) {
        window.visualViewport.removeEventListener('resize', handleViewportChange);
        window.visualViewport.removeEventListener('scroll', handleViewportChange);
      }
    };
  }, [isMobile]);

  // Calculate scroll area height dynamically
  useEffect(() => {
    const calculateScrollAreaHeight = () => {
      if (!isMobile || !headerRef.current || !inputRef.current) {
        setScrollAreaHeight('100%');
        return;
      }

      const headerHeight = headerRef.current.offsetHeight;
      const inputHeight = inputRef.current.offsetHeight;
      const availableHeight = viewportHeight - headerHeight - inputHeight;
      
      setScrollAreaHeight(`${availableHeight}px`);
    };

    calculateScrollAreaHeight();
    
    // Recalculate on viewport or content changes
    const resizeObserver = new ResizeObserver(calculateScrollAreaHeight);
    
    if (headerRef.current) resizeObserver.observe(headerRef.current);
    if (inputRef.current) resizeObserver.observe(inputRef.current);
    
    return () => {
      resizeObserver.disconnect();
    };
  }, [isMobile, viewportHeight]);

  useEffect(() => {
    if (selectedConversation) {
      setIsExiting(false);
      
      // Force focus on the scroll area when conversation changes
      if (isIOS() && isMobile) {
        setTimeout(() => {
          if (scrollAreaRef.current) {
            const scrollViewport = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
            if (scrollViewport instanceof HTMLElement) {
              scrollViewport.focus();
              // Also blur any previously focused elements
              const activeElement = document.activeElement;
              if (activeElement && activeElement instanceof HTMLElement) {
                activeElement.blur();
              }
              scrollViewport.focus();
            }
          }
        }, 200);
      }
    }
  }, [selectedConversation, isMobile]);

  const handleBackClick = () => {
    if (!onBack) return;

    if (isMobile) {
      setIsExiting(true);
      setTimeout(() => {
        onBack();
        setTimeout(() => {
          setIsExiting(false);
        }, 100);
      }, 250);
    } else {
      onBack();
    }
  };

  const scrollToBottom = () => {
    if (scrollAreaRef.current && bottomRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  };
  
  // Track last scroll position and direction
  const lastScrollTopRef = useRef(0);
  const messageInputRef = useRef<HTMLTextAreaElement>(null);
  

  // Track if we should auto-scroll (only when user is at bottom)
  const shouldAutoScrollRef = useRef(true);
  
  // Check if user is at bottom of scroll area
  const isAtBottom = () => {
    if (!scrollAreaRef.current) return true;
    const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
    if (!scrollContainer) return true;
    
    const { scrollTop, scrollHeight, clientHeight } = scrollContainer;
    return scrollTop + clientHeight >= scrollHeight - 50; // 50px threshold
  };

  // Update auto-scroll flag when user scrolls
  useEffect(() => {
    const scrollContainer = scrollAreaRef.current?.querySelector('[data-radix-scroll-area-viewport]');
    
    const handleScroll = () => {
      if (scrollContainer) {
        const currentScrollTop = scrollContainer.scrollTop;
        const scrollDifference = lastScrollTopRef.current - currentScrollTop;
        
        // Update auto-scroll flag based on position
        shouldAutoScrollRef.current = isAtBottom();
        
        // If scrolling up more than 40px, blur the input to close keyboard
        if (scrollDifference > 20 && isMobile) {
          if (messageInputRef.current) {
            messageInputRef.current.blur();
          }
        }
        
        lastScrollTopRef.current = currentScrollTop;
      }
    };
    
    if (scrollContainer) {
      scrollContainer.addEventListener('scroll', handleScroll);
    }
    
    return () => {
      if (scrollContainer) {
        scrollContainer.removeEventListener('scroll', handleScroll);
      }
    };
  }, [isMobile]);

  // Scroll to bottom when messages change, but only if user was already at bottom
  useEffect(() => {
    if (shouldAutoScrollRef.current) {
      const timer = setTimeout(() => {
        scrollToBottom();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [messages]);

  // Initial setup effect - only runs once per conversation change
  useEffect(() => {
    if (!selectedConversation) return;
    
    // Always scroll to bottom for new conversation
    scrollToBottom();
    shouldAutoScrollRef.current = true;
    
    // Focus the scroll area to enable scrolling without needing a click first
    if (scrollAreaRef.current) {
      // Use setTimeout to ensure the focus happens after the component is fully rendered
      setTimeout(() => {
        const scrollViewport = scrollAreaRef.current?.querySelector('[data-radix-scroll-area-viewport]');
        if (scrollViewport instanceof HTMLElement) {
          scrollViewport.focus();
          
          // On iOS, also try to prevent parent scroll by setting overflow on body
          if (isIOS() && isMobile) {
            document.body.style.overflow = 'hidden';
            document.body.style.position = 'fixed';
            document.body.style.width = '100%';
          }
        }
      }, 100);
    }
    
    // Cleanup function to restore body scroll
    return () => {
      if (isIOS() && isMobile) {
        document.body.style.overflow = '';
        document.body.style.position = '';
        document.body.style.width = '';
      }
    };
  }, [selectedConversation?.id]); // Only depend on conversation ID, not isMobile

  const handleFileClick = (file: MessageFile) => {
    // Only open the dialog if the file is an image
    if (file.fileName && isImageFile(file.fileName)) {
      setSelectedFile(file);
    }
    // For non-image files, clicking does nothing in terms of opening the dialog.
    // Download functionality is handled separately by the FilePreview component itself if needed.
  };

  const getParticipantInfo = () => {
    if (!selectedConversation || !selectedConversation.participants) {
      return { displayName: "Unknown", imageUrl: "" };
    }

    // Check if this is a support conversation (conversation name starts with "Ticket:")
    if (selectedConversation.name && selectedConversation.name.startsWith('Ticket:')) {
      const otherParticipant = selectedConversation.participants.find(
        (p: any) => p.User.id !== currentUserId
      );

      if (!otherParticipant) {
        return { displayName: "Customer Support", imageUrl: "" };
      }

      const { User } = otherParticipant;
      
      // If the other participant is support staff, show "Customer Support"
      if (otherParticipant.role === 'Support') {
        return {
          displayName: "Customer Support",
          imageUrl: getImageWithFallback(User.imageUrl, User.firstName, User.lastName, User.email, 400)
        };
      }
      
      // If current user is support staff viewing user, show only first name
      const currentUserParticipant = selectedConversation.participants.find((p: any) => p.User.id === currentUserId);
      if (currentUserParticipant?.role === 'Support') {
        return {
          displayName: User.firstName || User.email || "User",
          imageUrl: getImageWithFallback(User.imageUrl, User.firstName, User.lastName, User.email, 400)
        };
      }
    }

    const otherParticipant = selectedConversation.participants.find(
      (p: any) => p.User.id !== currentUserId
    );

    if (!otherParticipant) {
      return { displayName: "Unknown", imageUrl: "" };
    }

    const { User } = otherParticipant;
    let displayName = "Unknown";

    if (User.fullName) {
      displayName = User.fullName;
    } else if (User.firstName && User.lastName) {
      displayName = `${User.firstName} ${User.lastName}`;
    } else if (User.firstName || User.lastName) {
      displayName = User.firstName || User.lastName;
    } else if (User.email) {
      displayName = User.email;
    }

    return {
      displayName,
      imageUrl: getImageWithFallback(User.imageUrl, User.firstName, User.lastName, User.email, 400)
    };
  };

  const participantInfo = selectedConversation ? getParticipantInfo() : { displayName: "", imageUrl: "" };
  
  // Get participant user info for avatar fallback
  const getParticipantUser = () => {
    if (!selectedConversation || !selectedConversation.participants) return null;
    const otherParticipant = selectedConversation.participants.find(
      (p: any) => p.User.id !== currentUserId
    );
    return otherParticipant?.User || null;
  };
  
  const participantUser = selectedConversation ? getParticipantUser() : null;

  const downloadFile = (url: string, fileName: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const renderFullSizeFile = () => {
    if (!selectedFile) return null;

    const fileObject = {
      url: selectedFile.url,
      fileKey: selectedFile.fileKey || selectedFile.url,
      fileName: selectedFile.fileName || 'attachment',
      fileType: selectedFile.fileType,
    };

    if (isImageFile(selectedFile.fileName || '')) {
      return (
        <div className="flex flex-col items-center">
          <Image
            src={selectedFile.url}
            alt="Enlarged Image"
            width={800}
            height={800}
            className="max-h-[70vh] w-auto object-contain"
            priority
          />
          <Button
            variant="outline"
            size="sm"
            className="mt-4"
            onClick={() => downloadFile(selectedFile.url, selectedFile.fileName || 'image')}
          >
            <Download size={14} className="mr-2" />
            Download
          </Button>
        </div>
      );
    }

    return (
      <div className="flex flex-col items-center">
        <FilePreview
          file={fileObject}
          previewSize="large"
          allowDownload={true}
          allowPreview={false}
        />
      </div>
    );
  };

  const messageContainerClassName = `flex flex-col box-border no-wrap${
    isMobile
      ? ' w-full overflow-hidden fixed top-0 left-0'
      : ' h-[calc(100dvh-65px)] sm:h-[calc(100dvh-65px)] md:h-[calc(100dvh-80px)]'
  } bg-background w-full ${
    isMobile ? 'transform transition-transform duration-300 ease-in-out' : ''
  } ${isMobile && isExiting ? 'translate-x-full' : 'translate-x-0'}`;

  // On iOS, use initial height to prevent extra space when keyboard appears
  const containerStyle = isMobile ? { height: `${isIOS() ? initialHeight : viewportHeight}px` } : {};

  return (
    <div className={messageContainerClassName} style={containerStyle}>
      <div className="sticky top-0" ref={headerRef}>
        <ConversationHeader
          selectedConversation={selectedConversation}
          participantInfo={participantInfo}
          participantUser={participantUser}
          onBack={onBack}
          isMobile={isMobile}
          handleBackClick={handleBackClick}
        />
      </div>

      <div className="flex-1 w-full overflow-hidden" style={isMobile ? { height: scrollAreaHeight } : {}}>
        <ScrollArea 
          ref={scrollAreaRef} 
          className="h-full w-[101%] md:w-[100.7%] overflow-x-visible" 
          tabIndex={0}
          onTouchStart={() => {
            // Ensure focus on touch for iOS
            if (isIOS() && isMobile && scrollAreaRef.current) {
              const scrollViewport = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
              if (scrollViewport instanceof HTMLElement) {
                scrollViewport.focus();
              }
            }
          }}
        >
          <div className="py-2 px-4 min-h-full md:pb-2">
            <MessageList
              messages={messages}
              currentUserId={currentUserId}
              selectedConversation={selectedConversation}
              participantInfo={participantInfo}
              participantUser={participantUser}
              isOtherUserTyping={isOtherUserTyping}
              handleFileClick={handleFileClick}
            />
            <div ref={bottomRef} className="h-1" />
          </div>
        </ScrollArea>
      </div>

      <div className="sticky bottom-0" ref={inputRef}>
        <MessageInputArea
          onSendMessage={onSendMessage}
          selectedConversation={selectedConversation}
          onTyping={onTyping}
          handleFileClick={handleFileClick}
          textareaRef={messageInputRef}
        />
      </div>

      <Dialog open={!!selectedFile} onOpenChange={(open) => !open && setSelectedFile(null)}>
        <DialogContent className="max-w-3xl" hideCloseButton={false}>
          {selectedFile && (
            <div className="flex flex-col justify-center items-center">
              <h3 className="text-lg font-medium mb-4">{selectedFile.fileName}</h3>
              {renderFullSizeFile()}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MessageArea;