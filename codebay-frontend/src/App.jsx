import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import BuildDetail from './pages/BuildDetail';

function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/build/:slug" element={<BuildDetail />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

export default App;