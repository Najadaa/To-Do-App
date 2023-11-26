import { Navbar, Nav } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';

const Menu = () => {
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');

  const isAuthenticated = !!token;
  const isAdmin = role === 'admin';

  const navigate = useNavigate()

  const handleLogout = () => {
    // Clear token and role from local storage
    localStorage.removeItem('token');
    localStorage.removeItem('role');

    // Redirect to the login page
    navigate('/login');
  };

  return (
    <Navbar bg="light" expand="lg">
      <Navbar.Brand as={Link} to="/home">
        To Do App
      </Navbar.Brand>
      <Navbar.Toggle aria-controls="basic-navbar-nav" />
      <Navbar.Collapse id="basic-navbar-nav">
        <Nav className="mr-auto">
          <Nav.Link as={Link} to="/home">
            Home
          </Nav.Link>
          {isAuthenticated && (
            <>
              {isAdmin && (
                <Nav.Link as={Link} to="/admin">
                  Admin
                </Nav.Link>
              )}
            </>
          )}
        </Nav>
        <Nav>
          {isAuthenticated ? (
            <Nav.Link onClick={handleLogout} style={{ cursor: 'pointer' }}>
              Logout
            </Nav.Link>
          ) : (
            <>
              <Nav.Link as={Link} to="/login">
                Login
              </Nav.Link>
              <Nav.Link as={Link} to="/register">
                Register
              </Nav.Link>
            </>
          )}
        </Nav>
      </Navbar.Collapse>
    </Navbar>
  );
};

export default Menu;