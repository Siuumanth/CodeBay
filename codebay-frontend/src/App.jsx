import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import BuildDetail from './pages/BuildDetail';
import Configure from './pages/Configure';
import History from './pages/History';
import BuildHistoryDetail from './pages/BuildHistoryDetail';
import Login from './pages/Login';
import Register from './pages/Register';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          {/* Protected routes */}
          <Route path="/" element={
            <ProtectedRoute>
              <Layout>
                <Home />
              </Layout>
            </ProtectedRoute>
          } />
          <Route path="/build/:slug" element={
            <ProtectedRoute>
              <Layout>
                <BuildDetail />
              </Layout>
            </ProtectedRoute>
          } />
          <Route path="/configure" element={
            <ProtectedRoute>
              <Layout>
                <Configure />
              </Layout>
            </ProtectedRoute>
          } />
          <Route path="/history" element={
            <ProtectedRoute>
              <Layout>
                <History />
              </Layout>
            </ProtectedRoute>
          } />
          <Route path="/history/:id" element={
            <ProtectedRoute>
              <Layout>
                <BuildHistoryDetail />
              </Layout>
            </ProtectedRoute>
          } />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;