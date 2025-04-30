import { HashRouter, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import RestorePass from './pages/RestorePass';
import NotFound from './pages/NotFound';
import Main from './pages/Main';

function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/restore-pass" element={<RestorePass />} />
        <Route path="/main" element={<Main />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </HashRouter>
  );
}

export default App;
