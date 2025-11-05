import { openai } from '@ai-sdk/openai';
import { streamText, UIMessage, convertToModelMessages, stepCountIs } from 'ai';
import z from 'zod';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
  const { messages }: { messages: UIMessage[] } = await req.json();

  const result = streamText({
    model: openai('gpt-4o-mini'),
    messages: convertToModelMessages(messages),
    stopWhen: stepCountIs(3),
    tools:{
        getAllProducts:{
            description:'Get all products from the API',
            inputSchema: z.object({}),
            execute: async ()=>{
                console.log('Getting all products');
                const products = await fetch(`https://fakestoreapi.com/products`,{
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                }).then(res => res.json());
                console.log(products,'products');
               
                return products;
            }
        },
        getSingleProductById:{
            description:'Gets a signle product by id',
            inputSchema: z.object({
            id: z.number().describe('Id number of a product that is being searched')
            }),
            execute: async (input : {id: number})=>{
               
              
                const products = await fetch(`https://fakestoreapi.com/products/${input.id}`,{
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                }).then(res => res.json());
              
               console.log(products,'Single product');
                return products;
            }
        }
    }
  });

  return result.toUIMessageStreamResponse();
}