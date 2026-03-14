import { HashRouter, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import RestorePass from './pages/RestorePass';
import NotFound from './pages/NotFound';
import Main from './pages/Main';
import Income from './pages/Income';
import Dashboard from './pages/Dashboard';
import History from './pages/History';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/restore-pass" element={<RestorePass />} />
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/history" element={<ProtectedRoute><History /></ProtectedRoute>} />
        <Route path="/main" element={<ProtectedRoute><Main /></ProtectedRoute>} />
        <Route path="/income" element={<ProtectedRoute><Income /></ProtectedRoute>} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </HashRouter>
  );
}

export default App;
