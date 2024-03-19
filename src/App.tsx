import { LiveCode, LiveCodeSandbox } from './LiveCode'

function App() {
  return (
    <LiveCode
      onFilesChange={(hash: string) => {
        window.location.hash = hash
      }}
    />
  )
}

export default App
