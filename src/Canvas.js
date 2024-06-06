import React, { useState, useRef, useEffect } from 'react';

const Canvas = () => {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [prevPosition, setPrevPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;

    // Set up event listeners
    canvas.addEventListener('mousedown', startDrawing);
    canvas.addEventListener('mouseup', stopDrawing);
    canvas.addEventListener('mousemove', draw);

    return () => {
      // Clean up event listeners
      canvas.removeEventListener('mousedown', startDrawing);
      canvas.removeEventListener('mouseup', stopDrawing);
      canvas.removeEventListener('mousemove', draw);
    };
  }, []);

  const getCanvasCoordinates = (event) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    return {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    };
  };

  const startDrawing = (event) => {
    setIsDrawing(true);
    const pos = getCanvasCoordinates(event);
    setPrevPosition(pos);
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const draw = (event) => {
    if (!isDrawing) return;

    const context = canvasRef.current.getContext('2d');
    const currentPosition = getCanvasCoordinates(event);

    // Draw a line from previous position to current position
    context.beginPath();
    context.moveTo(prevPosition.x, prevPosition.y);
    context.lineTo(currentPosition.x, currentPosition.y);
    context.stroke();

    // Update previous position
    setPrevPosition(currentPosition);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    context.clearRect(0, 0, canvas.width, canvas.height);
  };

  return (
    <div>
      <button onClick={clearCanvas}>Clear</button>
      <canvas
        onMouseDown={startDrawing}
        onMouseUp={stopDrawing}
        onMouseMove={draw}
        ref={canvasRef}
        width={800}
        height={600}
        style={{ border: '1px solid black' }}
      />

    </div>
  );
}

export default Canvas;
