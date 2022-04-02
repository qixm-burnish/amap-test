import { APILoader } from '@uiw/react-amap'

import Demo from './demo'

import './App.css'

function App() {
  return (
    <div className="App">
      <APILoader akay="de6cfe80aa9fec068a38e213f7e56f5e">
        <Demo />
      </APILoader>
    </div>
  )
}

export default App
