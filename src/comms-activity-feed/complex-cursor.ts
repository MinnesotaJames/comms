import * as base64 from 'base-64';

interface MultiCursor {
  commsCursor: string | null;
  notesCursor: string | null;
  disputesCursor: string | null;
}

export function encodeCursor(cursors: MultiCursor): string {
  const cursorString = JSON.stringify(cursors);
  return base64.encode(cursorString);
}

export function decodeCursor(encodedCursor: string | null): MultiCursor {
  if (!encodedCursor) {
    return { commsCursor: null, notesCursor: null, disputesCursor: null };
  }

  const cursorString = base64.decode(encodedCursor);
  return JSON.parse(cursorString) as MultiCursor;
}