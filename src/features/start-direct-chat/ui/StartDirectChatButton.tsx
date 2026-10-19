import { Button, Icon } from '@/shared/ui';

import { useStartDirectChat } from '../model/useStartDirectChat';

interface StartDirectChatButtonProps {
  userId: number;
  username: string;
}

export function StartDirectChatButton({ userId, username }: StartDirectChatButtonProps) {
  const mutation = useStartDirectChat();

  return (
    <Button
      variant="ghost"
      size="sm"
      icon={<Icon name="message" size={17} />}
      loading={mutation.isPending}
      onClick={() => mutation.mutate(userId)}
      aria-label={`Написать ${username}`}
      title={`Написать ${username}`}
    />
  );
}
