export type TgUser = {
  id: string;
  telegram_id: number;
  username?: string | null;
  first_name?: string | null;
  last_name?: string | null;
  photo_url?: string | null;
  timezone?: string | null;
};
