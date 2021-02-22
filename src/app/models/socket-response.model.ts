import { ChatMessage } from './chat-message.model';

export interface SocketResponse {
  contentType: string;
  participantMessages: ChatMessage[];
  judgeMessages: ChatMessage[];
}
