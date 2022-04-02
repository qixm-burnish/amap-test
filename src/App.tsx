import { APILoader } from '@uiw/react-amap'

import Demo from './demo'

import './App.css'

function App() {
  return (
    <div className="App">
      <APILoader akay="ca9aa2e65bad33d40c4ef759008ef76c">
        <Demo />
      </APILoader>
    </div>
  )
}

export default App
