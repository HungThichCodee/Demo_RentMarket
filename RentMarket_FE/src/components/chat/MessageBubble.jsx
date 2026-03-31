import { memo } from 'react';

/**
 * Bong bóng tin nhắn — hiển thị 1 tin nhắn trong cuộc hội thoại.
 * React.memo tránh re-render khi tin nhắn cụ thể này không đổi.
 */
const MessageBubble = memo(({ message, isMine }) => {
  const formattedTime = message.timestamp
    ? new Date(message.timestamp).toLocaleTimeString('vi-VN', {
        hour: '2-digit',
        minute: '2-digit',
      })
    : '';

  // Phân biệt rõ tick mark: READ = ✓✓ xanh, DELIVERED = ✓✓ xám, SENT = ✓ xám
  const getStatusMark = (status) => {
    switch (status) {
      case 'READ':
        return <span className="text-[11px] text-primary font-medium">✓✓</span>;
      case 'DELIVERED':
        return <span className="text-[11px] text-slate-400">✓✓</span>;
      case 'SENT':
        return <span className="text-[11px] text-slate-400">✓</span>;
      default:
        return null;
    }
  };

  return (
    <div className={`flex ${isMine ? 'justify-end' : 'justify-start'} mb-2 group`}>
      <div className="relative max-w-[75%] sm:max-w-[65%]">
        {/* Bubble */}
        <div
          className={`
            px-4 py-2.5 text-[14px] leading-relaxed break-words
            transition-shadow duration-200
            ${isMine
              ? 'bg-primary text-white rounded-2xl rounded-br-md shadow-md'
              : 'bg-gray-100 text-slate-800 rounded-2xl rounded-bl-md shadow-sm border border-gray-200/60'
            }
          `}
        >
          {message.content}
        </div>

        {/* Timestamp + Status — hiện khi hover */}
        <div
          className={`
            flex items-center gap-1.5 mt-1 px-1
            opacity-0 group-hover:opacity-100 transition-opacity duration-200
            ${isMine ? 'justify-end' : 'justify-start'}
          `}
        >
          <span className="text-[11px] text-slate-400 font-medium">{formattedTime}</span>
          {isMine && message.status && getStatusMark(message.status)}
        </div>
      </div>
    </div>
  );
});

MessageBubble.displayName = 'MessageBubble';

export default MessageBubble;
