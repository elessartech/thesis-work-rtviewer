import Viewer from './components/Viewer/Viewer'
import useInitCornerstone from './hooks/useInitCornerstone'

function App() {
    const { loading } = useInitCornerstone()
    return <div className="App">{!loading && <Viewer />}</div>
}

export default App
