'use client';


import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
} from '@/components/ai-elements/conversation';
import { Message, MessageContent } from '@/components/ai-elements/message';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"
import {
  PromptInput,
  PromptInputActionAddAttachments,
  PromptInputActionMenu,
  PromptInputActionMenuContent,
  PromptInputActionMenuTrigger,
  PromptInputAttachment,
  PromptInputAttachments,
  PromptInputBody,
  PromptInputButton,
  PromptInputHeader,
  type PromptInputMessage,
  PromptInputModelSelect,
  PromptInputModelSelectContent,
  PromptInputModelSelectItem,
  PromptInputModelSelectTrigger,
  PromptInputModelSelectValue,
  PromptInputSubmit,
  PromptInputTextarea,
  PromptInputFooter,
  PromptInputTools,
} from '@/components/ai-elements/prompt-input';
import { Action, Actions } from '@/components/ai-elements/actions';
import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport, HttpChatTransport, TextStreamChatTransport } from 'ai';
import { Fragment, useState } from 'react';
import { Source, Sources, SourcesContent, SourcesTrigger } from '@/components/ai-elements/sources';
import { CopyIcon, GlobeIcon, RefreshCcwIcon } from 'lucide-react';
import { Response } from '@/components/ai-elements/response';
import { Reasoning, ReasoningContent, ReasoningTrigger } from '@/components/ai-elements/reasoning';
import { Loader } from '@/components/ai-elements/loader';



const models = [
  {
    name: 'GPT 4o',
    value: 'openai/gpt-4o',
  },
  {
    name: 'Deepseek R1',
    value: 'deepseek/deepseek-r1',
  },
];

export default function Chat() {
 
  const [input, setInput] = useState('');
  const [model, setModel] = useState<string>(models[0].value);
  const [webSearch, setWebSearch] = useState(false);
  const { messages, sendMessage, status, regenerate } = useChat({
    transport: new DefaultChatTransport({
      api: '/api',
    }),
  }); 

  const handleSubmit = (message: PromptInputMessage) => {
    const hasText = Boolean(message.text);
    const hasAttachments = Boolean(message.files?.length);
    if (!(hasText || hasAttachments)) {
      return;
    }
    sendMessage(
      { 
        text: message.text || 'Sent with attachments',
        files: message.files 
      },
      {
        body: {
          model: model,
          webSearch: webSearch,
        },
      },
    );
    setInput('');
  };


  return (
    <div className="max-w-7xl mx-auto p-6 relative size-full h-screen">
      <div className="flex flex-col h-full">
        <Conversation className="h-full">
          <ConversationContent>
            {messages.map((message) => (
              <div key={message.id}>
                {message.role === 'assistant' && message.parts.filter((part) => part.type === 'source-url').length > 0 && (
                 
                 <Sources>
                    <SourcesTrigger
                      count={
                        message.parts.filter(
                          (part) => part.type === 'source-url',
                        ).length
                      }
                    />
                    {message.parts.filter((part) => part.type === 'source-url').map((part, i) => (
                      <SourcesContent key={`${message.id}-${i}`}>
                        <Source
                          key={`${message.id}-${i}`}
                          href={part.url}
                          title={part.url}
                        />
                      </SourcesContent>
                    ))}
                  </Sources>
                )}

                {message.parts.map((part, i) => {
                  switch (part.type) {
                   
                  
                    
                    case 'text':
                      console.log(part,'part');
                      return (
                        <Fragment key={`${message.id}-${i}`}>
                          <Message from={message.role}>
                            <MessageContent>
                              <Response>
                                {part.text}
                              </Response>
                            </MessageContent>
                          </Message>
                          {message.role === 'assistant' && i === messages.length - 1 && (
                            <Actions className="mt-2">
                              <Action
                                onClick={() => regenerate()}
                                label="Retry"
                              >
                                <RefreshCcwIcon className="size-3" />
                              </Action>
                              <Action
                                onClick={() =>
                                  navigator.clipboard.writeText(part.text)
                                }
                                label="Copy"
                              >
                                <CopyIcon className="size-3" />
                              </Action>
                            </Actions>
                          )}
                        </Fragment>
                      );
                    case 'reasoning':
                      return (
                        <Reasoning
                          key={`${message.id}-${i}`}
                          className="w-full"
                          isStreaming={status === 'streaming' && i === message.parts.length - 1 && message.id === messages.at(-1)?.id}
                        >
                          <ReasoningTrigger />
                          <ReasoningContent>{part.text}</ReasoningContent>
                        </Reasoning>
                      );
                    default:
                      console.log(part,'part');
                      return null;
                  }
                })}
                { status === 'ready' &&   message.parts.filter((part) => part.type === 'tool-getAllProducts').map((part: any, i)=>{
                    const products = Array.isArray(part.output) ? part.output : [];
                    return (
                      <div key={`${message.id}-${i}`} className="my-4 max-w-5xl mx-auto">
                        <h3 className="text-lg font-semibold mb-4">Products ({products.length})</h3>
                        {products.length > 0 ? (
                          <Carousel className="w-full">
                            <CarouselContent>
                              {products.map((product: any, idx: number) => (
                                <CarouselItem key={product?.id || idx} className="md:basis-1/2 lg:basis-1/3">
                                  <Card className="h-full">
                                    <div className="aspect-square overflow-hidden rounded-t-xl">
                                      {product?.image && (
                                        <img
                                          src={product.image}
                                          alt={product?.title || 'Product'}
                                          className="w-full h-full object-cover"
                                        />
                                      )}
                                    </div>
                                    <CardHeader>
                                      <CardTitle className="line-clamp-2">{product?.title || 'Untitled Product'}</CardTitle>
                                      <CardDescription className="line-clamp-2">
                                        {product?.description || 'No description available'}
                                      </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                      <div className="flex items-center justify-between">
                                        <span className="text-2xl font-bold">${product?.price?.toFixed(2) || '0.00'}</span>
                                        {product?.rating && (
                                          <span className="text-sm text-muted-foreground">
                                            ⭐ {product.rating.rate} ({product.rating.count})
                                          </span>
                                        )}
                                      </div>
                                      {product?.category && (
                                        <span className="text-xs text-muted-foreground mt-2 block capitalize">
                                          {product.category}
                                        </span>
                                      )}
                                    </CardContent>
                                  </Card>
                                </CarouselItem>
                              ))}
                            </CarouselContent>
                            <CarouselPrevious />
                            <CarouselNext />
                          </Carousel>
                        ) : (
                          <p className="text-muted-foreground">No products found</p>
                        )}
                      </div>
                    );
                  })
                }
              </div>
            ))}
            {status === 'submitted' && <Loader />}
          </ConversationContent>
          <ConversationScrollButton />
        </Conversation>
        <PromptInput onSubmit={handleSubmit} className="mt-4" globalDrop multiple>
          <PromptInputHeader>
            <PromptInputAttachments>
              {(attachment) => <PromptInputAttachment data={attachment} />}
            </PromptInputAttachments>
          </PromptInputHeader>
          <PromptInputBody>
            <PromptInputTextarea
              onChange={(e) => setInput(e.target.value)}
              value={input}
            />
          </PromptInputBody>
          <PromptInputFooter>
            <PromptInputTools>
              <PromptInputActionMenu>
                <PromptInputActionMenuTrigger />
                <PromptInputActionMenuContent>
                  <PromptInputActionAddAttachments />
                </PromptInputActionMenuContent>
              </PromptInputActionMenu>
              <PromptInputButton
                variant={webSearch ? 'default' : 'ghost'}
                onClick={() => setWebSearch(!webSearch)}
              >
                <GlobeIcon size={16} />
                <span>Search</span>
              </PromptInputButton>
              <PromptInputModelSelect
                onValueChange={(value) => {
                  setModel(value);
                }}
                value={model}
              >
                <PromptInputModelSelectTrigger>
                  <PromptInputModelSelectValue />
                </PromptInputModelSelectTrigger>
                <PromptInputModelSelectContent>
                  {models.map((model) => (
                    <PromptInputModelSelectItem key={model.value} value={model.value}>
                      {model.name}
                    </PromptInputModelSelectItem>
                  ))}
                </PromptInputModelSelectContent>
              </PromptInputModelSelect>
            </PromptInputTools>
            <PromptInputSubmit disabled={!input && !status} status={status} />
          </PromptInputFooter>
        </PromptInput>
      </div>
    </div>
  );
}