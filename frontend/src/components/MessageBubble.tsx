import { format } from "date-fns";
import { Check, CheckCheck } from "lucide-react";

interface MessageBubbleProps {
    id: number;
    content: string;
    isMe: boolean;
    status: string;
    timestamp: string;
}

export default function MessageBubble({ content, isMe, status, timestamp }: MessageBubbleProps) {
    const formattedTime = format(new Date(timestamp), "hh:mm a");

    if (isMe) {
        return (
            <div className="flex w-full mb-1 justify-end group">
                <div className="relative bg-indigo-600 text-white p-2.5 px-3.5 rounded-xl rounded-tr-sm max-w-[75%] shadow-lg shadow-indigo-600/20 bubble-right">
                    <p className="text-[15px] leading-relaxed break-words">{content}</p>
                    <div className="flex justify-end items-center mt-1 space-x-1 float-right ml-3 text-indigo-200">
                        <span className="text-[10px]">{formattedTime}</span>
                        {status === "sent" && <Check className="w-3.5 h-3.5 text-indigo-300" />}
                        {status === "delivered" && <CheckCheck className="w-3.5 h-3.5 text-indigo-300" />}
                        {status === "read" && <CheckCheck className="w-3.5 h-3.5 text-blue-300" />}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex w-full mb-1 group inline-flex relative">
            <div className="relative bg-zinc-800 text-zinc-100 p-2.5 px-3.5 rounded-xl rounded-tl-sm max-w-[75%] shadow-md border border-white/5 bubble-left">
                <p className="text-[15px] leading-relaxed break-words">{content}</p>
                <div className="flex justify-end items-center mt-1 space-x-1 float-right ml-3 text-zinc-400">
                    <span className="text-[10px]">{formattedTime}</span>
                </div>
            </div>
        </div>
    );
}
