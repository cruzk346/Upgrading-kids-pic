import React, { useState, useRef, useEffect } from 'react';

const Canvas = () => {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [prevPosition, setPrevPosition] = useState({ x: 0, y: 0 });
  const [prompt, setPrompt] = useState('');
  const [imageSrc, setImageSrc] = useState(null);

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
    context.strokeStyle = 'white';

    // Update previous position
    setPrevPosition(currentPosition);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    context.clearRect(0, 0, canvas.width, canvas.height);
  };

  const handlePromptChange = (event) => {
    setPrompt(event.target.value);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!prompt) {
      alert('Prompt is required');
      return;
    }

    const canvas = canvasRef.current;
    canvas.toBlob(async (blob) => {
      const formData = new FormData();
      formData.append('sketch_file', blob, 'sketch.png');
      formData.append('prompt', prompt);

      try {
        const API_KEY = '2ecf04a195b288eb687a5322af23a01a7cae99a8964c46100833d74c1ffb95b5d0616aff7ad64bb62d73559377d58019';
        const response = await fetch('https://clipdrop-api.co/sketch-to-image/v1/sketch-to-image', {
          method: 'POST',
          headers: {
            'x-api-key': API_KEY,
          },
          body: formData,
        });

        if (!response.ok) {
          throw new Error(`Error: ${response.statusText}`);
        }

      // Check content type
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('image')) {
        // Response is an image
        const imageURL = URL.createObjectURL(await response.blob());
        setImageSrc(imageURL);
      } else {
        // Handle other types of responses
        console.log('Response is not an image');
      }
    } catch (error) {
      console.error('Error:', error);
    }
  });
};

  return (
    <div>
      <button id="clear" onClick={clearCanvas}></button>
      <canvas
        onMouseDown={startDrawing}
        onMouseUp={stopDrawing}
        onMouseMove={draw}
        ref={canvasRef}
        width={1024}
        height={1024}
        style={{ border: '1px solid black' }}
      />
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="prompt">Prompt: </label>
          <textarea
            id="prompt"
            value={prompt}
            onChange={handlePromptChange}
            maxLength="500"
            required
          />
        </div>
        <button type="submit" >Submit</button>
      </form>
      {imageSrc && (
        <div>
          <h2>Generated Image</h2>
          <img src={imageSrc} alt="Generated" />
        </div>
        )}
    </div>
  );
};

export default Canvas;
