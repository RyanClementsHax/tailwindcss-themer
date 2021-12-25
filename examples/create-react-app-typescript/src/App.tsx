import { useState } from 'react'
import logo from './logo.svg'
import './App.css'

function App() {
  const [theme, setTheme] = useState('')
  return (
    <div className={'App ' + theme}>
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <h1 className="text-3xl font-bold underline text-primary-500">
          Hello world!
        </h1>
        <p className="text-secondary-500">
          Edit <code>src/App.js</code> and save to reload.
        </p>
        <select
          className="text-gray-800 border border-gray-800"
          value={theme}
          onChange={({ target: { value } }) => setTheme(value)}
        >
          <option value="">default</option>
          <option>dark</option>
          <option>neon</option>
        </select>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </header>
    </div>
  )
}

export default App
