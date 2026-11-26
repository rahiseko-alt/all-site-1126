import Hero from './components/Hero';
import Features from './components/Features';
import Comparison from './components/Comparison';
import Conclusion from './components/Conclusion';
import './App.css';

function App() {
  return (
    <div className="lp-container">
      <Hero />
      <Features />
      <Comparison />
      <Conclusion />
    </div>
  );
}

export default App;
