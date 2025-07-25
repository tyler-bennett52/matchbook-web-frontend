import React, { useState, useRef, useEffect } from 'react';
import { UploadButton } from "@/app/utils/uploadthing";
import { PaperclipIcon, X, Loader2 } from 'lucide-react';
import Image from "next/image";
import { FilePreview } from '@/components/ui/file-preview';
import { isImageFile } from '@/lib/utils';
import { useWindowSize } from '@/hooks/useWindowSize';
import { useIsMobile } from '@/hooks/use-mobile';
import { AttachmentCarouselDialog, AttachmentFileItem } from '@/components/ui/attachment-carousel-dialog';

interface MessageFile {
  url: string;
  fileName?: string;
  fileKey?: string;
  fileType?: string;
  fileSize?: number;
}

interface UploadData {
  name: string;
  size: number;
  key: string;
  serverData: {
    uploadedBy: string;
    url: string;
  };
  url: string;
  customId: string | null;
  type: string;
}

interface MessageInputAreaProps {
  onSendMessage: (message: string, attachments?: MessageFile[]) => void;
  selectedConversation: any;
  onTyping?: (isTyping: boolean) => void;
  handleFileClick: (file: MessageFile) => void;
  textareaRef?: React.RefObject<HTMLTextAreaElement>;
}

const getStorageKey = (conversationId: string) => `message_draft_${conversationId}`;
const getRecentConversationKey = () => 'recent_conversation_change';

interface StoredDraft {
  message: string;
  attachments: MessageFile[];
  timestamp: number;
}

interface RecentConversationChange {
  previousId: string;
  message: string;
  attachments: MessageFile[];
  timestamp: number;
}

const MessageInputArea: React.FC<MessageInputAreaProps> = ({
  onSendMessage,
  selectedConversation,
  onTyping,
  handleFileClick,
  textareaRef: externalTextareaRef,
}) => {
  const inputAreaClassNames = "flex-1 px-5 focus:outline-none text-black resize-none w-full min-h-[44px] max-h-[132px] overflow-y-hidden leading-relaxed font-jakarta";
  const inputContainerClassNames = "flex items-center mb-4 bg-white border-gray-300 border focus:outline-none w-full focus:ring-1 focus:ring-black overflow-hidden transition-all duration-300 ease-in-out";

  const isIOS = () => {
    return /iPhone|iPad|iPod/i.test(navigator.userAgent) || 
           (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  };

  const calculateBorderRadius = (messageLength: number, screenWidth: number | undefined) => {
    if (messageLength === 0) return '9999px';
    if (messageLength > 60) return screenWidth && screenWidth >= 768 ? '1.25rem' : '0.375rem';
    else if (messageLength > 40) return screenWidth && screenWidth >= 768 ? '1.5rem' : '0.5rem';
    else if (messageLength > 20) return screenWidth && screenWidth >= 768 ? '2rem' : '0.75rem';
    else return screenWidth && screenWidth >= 768 ? '3rem' : '1.5rem';
  };

  const [newMessageInput, setNewMessageInput] = useState('');
  const [messageAttachments, setMessageAttachments] = useState<MessageFile[]>([]);
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
  const internalTextareaRef = useRef<HTMLTextAreaElement>(null);
  const textareaRef = externalTextareaRef || internalTextareaRef;
  const inputContainerRef = useRef<HTMLDivElement>(null);
  const uploadContainerRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const { width, height } = useWindowSize();
  const isMobile = useIsMobile();

  const prevConversationIdRef = useRef<string | null>(null);
  const prevWindowHeight = useRef<number | undefined>(height);

  const [isAttachmentCarouselOpen, setIsAttachmentCarouselOpen] = useState(false);
  const [carouselInitialIndex, setCarouselInitialIndex] = useState(0);

  // Ref for native file input
  const fileInputRef = useRef<HTMLInputElement>(null);
  // Click handler with delay to work around iOS keyboard dismissal timing
  const handleDelayedClick = () => {
    if (isMobile && isKeyboardVisible) {
      textareaRef.current?.blur();
      setTimeout(() => fileInputRef.current?.click(), 300);
    } else {
      fileInputRef.current?.click();
    }
  };

  useEffect(() => {
    prevWindowHeight.current = height;
  }, [height]);

  useEffect(() => {
    const handleFocus = () => {
      if (isMobile) setIsKeyboardVisible(true);
    };

    const handleBlur = () => {
      if (isMobile) {
        setTimeout(() => setIsKeyboardVisible(false), 100);
      }
    };

    if (textareaRef.current) {
      textareaRef.current.addEventListener('focus', handleFocus);
      textareaRef.current.addEventListener('blur', handleBlur);
    }

    return () => {
      if (textareaRef.current) {
        textareaRef.current.removeEventListener('focus', handleFocus);
        textareaRef.current.removeEventListener('blur', handleBlur);
      }
    };
  }, [isMobile, textareaRef]);

  useEffect(() => {
    if (selectedConversation?.id !== prevConversationIdRef.current && prevConversationIdRef.current !== null) {
      setNewMessageInput('');
      setMessageAttachments([]);
      if (textareaRef.current) textareaRef.current.style.height = "44px";
    }
    prevConversationIdRef.current = selectedConversation?.id || null;
  }, [selectedConversation]);

  const [isUploading, setIsUploading] = useState(false);

  const handleSend = () => {
    const hasContent = newMessageInput.trim() || messageAttachments.length > 0;
    if (!hasContent) return;

    const messageContent = newMessageInput.trim();
    if (messageAttachments.length > 0) {
      onSendMessage(messageContent, messageAttachments);
    } else {
      onSendMessage(messageContent);
    }

    setNewMessageInput('');
    setMessageAttachments([]);
    if (textareaRef.current) textareaRef.current.style.height = "44px";
    
    if (selectedConversation?.id) {
      localStorage.removeItem(getStorageKey(selectedConversation.id));
      const recentChangeData = localStorage.getItem(getRecentConversationKey());
      if (recentChangeData) {
        const recentChange: RecentConversationChange = JSON.parse(recentChangeData);
        if (recentChange.previousId === selectedConversation.id) {
          localStorage.removeItem(getRecentConversationKey());
        }
      }
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleUploadFinish = (res: UploadData[]) => {
    console.log('=== UPLOAD FINISH ===', res);
    const attachments: MessageFile[] = res.map(r => ({
      url: r.url,
      fileName: r.name,
      fileKey: r.key,
      fileType: r.type,
      fileSize: r.size
    }));
    console.log('Setting message attachments:', attachments);
    setMessageAttachments(prev => [...prev, ...attachments]);
  };

  const openAttachmentCarousel = (index: number) => {
    setCarouselInitialIndex(index);
    setIsAttachmentCarouselOpen(true);
  };

  const handleNativeFiles = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files?.length) return;
    const formData = new FormData();
    Array.from(files).forEach(file => formData.append('files', file));
    setIsUploading(true);
    try {
      const res = await fetch('/api/uploadthing/uploadFiles', { method: 'POST', body: formData });
      const data = (await res.json()) as UploadData[];
      handleUploadFinish(data);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsUploading(false);
      e.target.value = '';
    }
  };

  return (
    <div
      className={`${isMobile ? `${isIOS() ? 'sticky' : 'sticky'} bottom-0 z-30 bg-background transition-all duration-300 pr-4` : 'relative pr-0 pb-1 md:pl-4 bg-transparent'} overflow-x-hidden`}
      style={{
        paddingBottom: isMobile ? '8px' : undefined,
        left: isMobile && isIOS() ? '0' : undefined,
        right: isMobile && isIOS() ? '0' : undefined,
      }}
    >
      {messageAttachments.length > 0 && (
        <div className="scrollbar-hide py-1 space-x-2 mb-2 bg-black/15 px-2 rounded">
          {messageAttachments.map((attachment, index) => {
            const handleRemoveAttachment = () => {
              setMessageAttachments(prev => prev.filter((_, i) => i !== index));
            };

            const isImage = isImageFile(attachment.fileName || '');
            const fileObjectForPreview = {
              fileUrl: attachment.url,
              fileKey: attachment.fileKey || attachment.url,
              fileName: attachment.fileName || 'attachment',
              fileType: attachment.fileType,
              fileSize: attachment.fileSize,
            };

            return (
              <div key={index} className="inline-block flex-shrink-0 aspect-square rounded group">
                {isImage ? (
                  <div className="relative aspect-square h-[80px] w-[80px] md:h-[100px] md:w-[100px]">
                    <button
                      className="absolute top-0 right-0 z-10 w-5 h-5 bg-white/80 hover:bg-white/90 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={handleRemoveAttachment}
                      aria-label="Remove attachment"
                    >
                      <X size={12} />
                    </button>
                    <Image
                      src={attachment.url}
                      alt={attachment.fileName || "Message Attachment"}
                      width={100}
                      height={100}
                      className="cursor-pointer object-cover aspect-square w-full h-full"
                      onClick={() => openAttachmentCarousel(index)}
                    />
                  </div>
                ) : (
                  <div className="aspect-square h-[80px] w-[80px] md:h-[100px] md:w-[100px]">
                    <FilePreview
                      file={fileObjectForPreview}
                      previewSize="small"
                      allowPreview={false}
                      allowDownload={false}
                      showRemove={true}
                      onRemove={handleRemoveAttachment}
                      onClick={() => openAttachmentCarousel(index)}
                      className="h-full w-full aspect-square"
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <div
        ref={inputContainerRef}
        className={`${inputContainerClassNames} ${isMobile ? 'mx-2' : ''}`}
        style={{
          borderRadius: calculateBorderRadius(newMessageInput.length, width)
        }}
      >
        <textarea
          ref={textareaRef}
          className={`${inputAreaClassNames} flex items-center self-center my-auto`}
          placeholder="Type a message..."
          value={newMessageInput}
          style={{
            display: 'flex',
            alignItems: 'center',
            paddingTop: '11px',
            paddingBottom: '11px',
          }}
          onChange={(e) => {
            setNewMessageInput(e.target.value);
            const textarea = e.target;
            textarea.style.height = "44px";
            const scrollHeight = textarea.scrollHeight;
            if (scrollHeight > 44) {
              const newHeight = Math.min(scrollHeight, 132);
              textarea.style.height = `${newHeight}px`;
            }
            if (onTyping && selectedConversation) {
              if (typingTimeoutRef.current) {
                clearTimeout(typingTimeoutRef.current);
              }
              onTyping(true);
              typingTimeoutRef.current = setTimeout(() => {
                if (onTyping) onTyping(false);
              }, 3000);
            }
          }}
          onKeyPress={handleKeyPress}
          disabled={!selectedConversation}
          rows={1}
        />

        <div className="flex items-center px-2">
          <div 
            className={`p-2 ${!selectedConversation ? "opacity-50 pointer-events-none" : ""} relative`}
            ref={uploadContainerRef}
          >
            <input
              type="file"
              multiple
              hidden
              ref={fileInputRef}
              onChange={handleNativeFiles}
            />
            <button
              type="button"
              className="p-2 text-gray-600 hover:text-gray-800 disabled:opacity-50"
              onClick={handleDelayedClick}
              disabled={!selectedConversation}
            >
              {isUploading ? (
                <Loader2 className="w-5 h-5 text-gray-600 animate-spin" />
              ) : (
                <PaperclipIcon className="w-5 h-5" />
              )}
            </button>
          </div>

          <button
            className="p-2 mx-1 text-gray-600 hover:text-gray-800 disabled:opacity-50"
            onClick={handleSend}
            disabled={!selectedConversation || (!newMessageInput.trim() && messageAttachments.length === 0)}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 1.414L10.586 9H7a1 1 0 100 2h3.586l-1.293 1.293a1 1 0 101.414 1.414l3-3a1 1 0 000-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      </div>

      {messageAttachments.length > 0 && (
        <AttachmentCarouselDialog
          attachments={messageAttachments as AttachmentFileItem[]}
          isOpen={isAttachmentCarouselOpen}
          onOpenChange={setIsAttachmentCarouselOpen}
          initialIndex={carouselInitialIndex}
        />
      )}
    </div>
  );
};

export default MessageInputArea;