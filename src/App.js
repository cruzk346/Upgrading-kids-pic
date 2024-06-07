import React from 'react';
import Canvas from './Canvas'; // Corrected the filename and capitalized 'Canvas'
import './App.css';

const App = () => {




  return (
    <div>
      <label for="sketch">Draw on the Canvas and submit to see results!</label>
        <Canvas />
    </div>
  );
}

export default App;
