import Cursor from "./Cursor";
import { COLORS } from "../../constants";
import { LiveCursorProps } from "../../types/canvas";

// Display all other live cursors with enhanced user information
const LiveCursors = ({ others }: LiveCursorProps) => {
  return others.map(({ connectionId, presence, info }) => {
    if (presence == null || !presence?.cursor) {
      return null;
    }

    // Use user's custom color if available, otherwise fall back to default colors
    const userColor = info?.color || COLORS[Number(connectionId) % COLORS.length];
    const userName = info?.name || `User ${connectionId}`;

    return (
      <Cursor
        key={connectionId}
        color={userColor}
        x={presence.cursor.x}
        y={presence.cursor.y}
        message={presence.message}
        userName={userName}
      />
    );
  });
};

export default LiveCursors;