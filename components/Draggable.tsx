
import React, { useState, useRef, useEffect } from 'react';
import { LevelAsset } from '../types';
import { audioService } from '../services/audioService';

interface DraggableProps {
  asset: LevelAsset;
  onDrop: (id: string, x: number, y: number, rect: DOMRect) => void;
  onClick: (id: string) => void;
}

export const Draggable: React.FC<DraggableProps> = ({ asset, onDrop, onClick }) => {
  // We track the *offset* in pixels from the initial percentage position.
  // This ensures the element renders correctly on load (using CSS %) regardless of container size.
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  
  const elementRef = useRef<HTMLDivElement>(null);
  const startPos = useRef({ x: 0, y: 0 });
  const hasMoved = useRef(false);

  // Reset state when the level/asset changes
  useEffect(() => {
    setDragOffset({ x: 0, y: 0 });
    setIsDragging(false);
    hasMoved.current = false;
  }, [asset.id, asset.initialX, asset.initialY]);

  const handlePointerDown = (e: React.PointerEvent) => {
    // Even if not draggable, we might want to capture click, but for dragging specifically:
    if (!asset.draggable) {
        // Just prepare for a potential click
        hasMoved.current = false;
        return;
    }

    e.preventDefault(); // Prevent text selection
    e.stopPropagation(); 
    
    // Play sound on pickup
    audioService.playPop();
    
    setIsDragging(true);
    hasMoved.current = false;
    startPos.current = { x: e.clientX, y: e.clientY };
    
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;
    
    e.preventDefault();
    
    // Calculate delta since the start of *this* drag gesture
    const dx = e.clientX - startPos.current.x;
    const dy = e.clientY - startPos.current.y;

    // We don't update state for every micro-movement if we wanted to optimize, 
    // but for this game, immediate feedback is needed.
    // Note: We add to the *existing* dragOffset if we wanted cumulative drags, 
    // but here we are doing a fresh calculation based on the updated state approach below.
    
    // Actually, simpler logic for React:
    // Update offset relative to previous render frame? No, that causes drift.
    // Better: Update state by adding the movement delta of this event.
    
    if (Math.abs(e.movementX) > 0 || Math.abs(e.movementY) > 0) {
        hasMoved.current = true;
        setDragOffset(prev => ({
            x: prev.x + e.movementX,
            y: prev.y + e.movementY
        }));
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    // Handle Click
    if (!hasMoved.current && !isDragging) {
        onClick(asset.id);
        return;
    }
    
    if (isDragging) {
        setIsDragging(false);
        e.currentTarget.releasePointerCapture(e.pointerId);
        
        // Handle Drop / Click if it didn't move much
        if (!hasMoved.current) {
            onClick(asset.id);
        } else {
             if (elementRef.current) {
                const rect = elementRef.current.getBoundingClientRect();
                onDrop(asset.id, 0, 0, rect); // x,y ignored by App.tsx, it uses rect
            }
        }
    }
  };

  return (
    <div
      ref={elementRef}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      className={`absolute flex items-center justify-center select-none touch-none ${asset.draggable ? 'cursor-grab active:cursor-grabbing' : 'cursor-pointer'}`}
      style={{
        // Critical Fix: Use percentage positioning for the anchor point
        left: `${asset.initialX}%`,
        top: `${asset.initialY}%`,
        // Apply Drag Offset via transform. 
        // -50% centers the element on its anchor. 
        // ${dragOffset.x}px moves it from there.
        transform: `translate(calc(-50% + ${dragOffset.x}px), calc(-50% + ${dragOffset.y}px))`,
        width: asset.width,
        height: asset.height,
        zIndex: isDragging ? 100 : asset.zIndex || 10,
        // Disable transition during drag for responsiveness
        transition: isDragging ? 'none' : 'transform 0.1s, color 0.2s, filter 0.2s',
      }}
    >
      {asset.type === 'text' && (
        <span className="text-5xl pointer-events-none drop-shadow-sm filter select-none leading-none flex items-center justify-center h-full w-full">
            {asset.content}
        </span>
      )}
      {asset.type === 'image' && (
        <img src={asset.content} alt={asset.id} className="w-full h-full object-contain pointer-events-none rounded-lg select-none" />
      )}
      {asset.type === 'shape' && (
        <div className={`w-full h-full ${asset.content} pointer-events-none rounded shadow-sm select-none`}></div>
      )}
    </div>
  );
};
