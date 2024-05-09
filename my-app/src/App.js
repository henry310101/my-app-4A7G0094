
import './App.css';
import MySlider from './components/MySlider';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>hello react! 20240508</h1>
        <h2>react第一個元件</h2>
        <p>
          資工三甲 4A7G0094 朱紘緯
        </p>
       <MySlider color="RED" />
       <MySlider color="GREEN"/>
       <MySlider color="BLUE"/>
      </header>
    </div>
  );
}

export default App;
