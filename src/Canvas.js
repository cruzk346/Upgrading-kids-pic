import React, { useState, useRef, useEffect } from 'react';
import './App.css';


const Canvas = () => {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [prevPosition, setPrevPosition] = useState({ x: 0, y: 0 });
  const [prompt, setPrompt] = useState('');
  const [imageSrc, setImageSrc] = useState(null);
  const [history, setHistory] = useState([]);
  const [tool, setTool] = useState('pencil');
  const [canvasHistory, setCanvasHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

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
  }, [tool]); // Re-runs effect when tool changes

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
    //adding functionality for different tools
    if (tool === 'pencil') {
      context.strokeStyle = 'white';
      context.lineWidth = 10;
      context.lineCap = 'round';
    } else if(tool === 'eraser') {
      //setting eraser
      context.strokeStyle = 'black';
      context.lineWidth = 20;
    }
    //actually draw the line
    context.stroke();

    // Update previous position
    setPrevPosition(currentPosition);
  };
//storing the canvas state temporarily for undo and redo
  const saveCanvasState = () => {
    const canvas = canvasRef.current;
    const dataUrl = canvas.toDataURL();
    setCanvasHistory((prevHistory) => [...prevHistory.slice(0, historyIndex + 1), dataUrl]);
    setHistoryIndex((prevIndex) => prevIndex + 1);
  };
//adding undo and redo functionality
  const undo = () => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      restoreCanvasState(canvasHistory[newIndex]);
    }
  };

  const redo = () => {
    if (historyIndex < canvasHistory.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      restoreCanvasState(canvasHistory[newIndex]);
    }
  };

  const restoreCanvasState = (dataUrl) => {
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    const image = new Image();
    image.src = dataUrl;
    image.onload = () => {
      context.clearRect(0, 0, canvas.width, canvas.height);
      context.drawImage(image, 0, 0, canvas.width, canvas.height);
    };
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    context.clearRect(0, 0, canvas.width, canvas.height);
    saveCanvasState();
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
    const canvasDataURL = canvas.toDataURL('image/png');
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

        //setting history
        setHistory((prevHistory) => [
          ...prevHistory,
          { prompt, canvasDataURL, imageURL }
        ]);

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
    <div id="results">
      <div id="tools">
        <button className="image-button" id="clear" onClick={clearCanvas}>
          <img src="clear icon.png" alt="Clear" />
        </button>
        <button className="image-button" id="undo" onClick={undo}>
          <img src="undo icon.png" alt="Undo" />
        </button>
        <button className="image-button" id="redo" onClick={redo}>
          <img src="redo icon.png" alt="Redo" />
        </button>
        <button className="image-button" id="pencil" onClick={() => setTool('pencil')}>
          <img src="pencil icon.png" alt="Pencil" />
        </button>
        <button className="image-button" id="eraser" onClick={() => setTool('eraser')}>
          <img src="eraser icon.png" alt="Eraser" />
        </button>
      </div>
      <canvas id="submitcanvas"
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
          <label>Prompt: </label>
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
        <div id="generated">
          <h2>Generated Image</h2>
          <img src={imageSrc} alt="Generated" />
        </div>
        )}
        {history.length > 0 && (
        <div id="history" >
          <h2>History</h2>
          <ul>
            {history.map((item, index) => (
              <li id="promptResult" key={index} style={{
                display: 'flex',
                alignItems: 'center',
                marginTop: '20px',
                flexFlow: 'wrap',
                border: '1px solid black',
                borderRadius: '5px',
                backgroundSize: 'auto' }}>
                <div>
                  <p><strong>Prompt:</strong> {item.prompt}</p>
                  <p><strong>Canvas: </strong></p>
                  <img id="savedCanvas" src={item.canvasDataURL} alt={`Canvas ${index}`} style={{ width: '100px' }} />
                  <a href={item.canvasDataURL} download={`canvas-${index}.png`}>Download</a>
                  <p><strong>Generated: </strong></p>
                  <img id="generatedPic" src={item.imageURL} alt={`Generated ${index}`} style={{ width: '100px' }} />
                  <a href={item.imageURL} download={`generated-${index}.png`}>Download</a>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default Canvas;
