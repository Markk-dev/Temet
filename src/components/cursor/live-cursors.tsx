import React, { useMemo } from 'react'
import Cursor from './cursor'
import { LiveCursorProps } from '../../types/type'
import { COLORS } from '../../../constants'

const LiveCursors = React.memo(({others}: LiveCursorProps) => {
    const cursors = useMemo(() => {
        return others.map(({connectionId, presence}) => {
            if(!presence?.cursor) return null;
            
            return (
                <Cursor 
                    key={connectionId}
                    color={COLORS[Number(connectionId) % COLORS.length]}
                    x={presence.cursor.x}
                    y={presence.cursor.y}
                    message={presence.message}
                />
            );
        }).filter(Boolean);
    }, [others]);

    return <>{cursors}</>;
}, (prevProps, nextProps) => {
    // Custom comparison for better performance
    if (prevProps.others.length !== nextProps.others.length) {
        return false;
    }
    
    return prevProps.others.every((prevOther, index) => {
        const nextOther = nextProps.others[index];
        return (
            prevOther.connectionId === nextOther.connectionId &&
            prevOther.presence?.cursor?.x === nextOther.presence?.cursor?.x &&
            prevOther.presence?.cursor?.y === nextOther.presence?.cursor?.y &&
            prevOther.presence?.message === nextOther.presence?.message
            
        );
    });
});

LiveCursors.displayName = "LiveCursors";

export default LiveCursors