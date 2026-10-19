export interface Message {
  id: number;
  roomId: number;
  author: {
    id: number;
    username: string;
  };
  body: string;
  createdAt: string;
}

/** Страница истории. Сообщения внутри — от новых к старым, как отдаёт сервер. */
export interface HistoryPage {
  messages: Message[];
  nextBefore: number | null;
}
