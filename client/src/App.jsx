import 'bootstrap/dist/css/bootstrap.min.css'
import Signup from './Signup'
import Login from './Login'
import Home from './Home'
import {BrowserRouter, Routes, Route, Navigate} from 'react-router-dom'
import AdminDashboard from './Admin'

const AppRoutes = () => {
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');

  const isAuthenticated = !!token;
  const isAdmin = role === 'admin';

  return (
    <Routes>
      <Route path='/register' element={<Signup />} />
      <Route path='/login' element={<Login />} />
      <Route
        path='/home'
        element={isAuthenticated ? <Home /> : <Navigate to="/login" />}
      />
      <Route
        path='/admin'
        element={isAdmin ? <AdminDashboard /> : <Navigate to="/login" />}
      />
      <Route
        path='/'
        element={isAuthenticated ? <Home /> : <Navigate to="/login" />}
      />
    </Routes>
  );
};

const App = () => {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
};

export default App;