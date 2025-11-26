/**
 * KB Memo Types
 * Shared types for KB MEMO table queries (database row structure)
 */

export interface KbMemoRow {
  MEMO_BAN: string;
  MEMO_SUBSCRIBER: string;
  MEMO_TYPE: string;
  MEMO_SYSTEM_TXT: string | null;
  MEMO_MANUAL_TXT: string | null;
  MEMO_DATE: Date;
}
