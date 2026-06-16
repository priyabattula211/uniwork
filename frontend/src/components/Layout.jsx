import { Link, NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Layout() {
  const { user, logout } = useAuth();

  return (
    <div className="app-shell">
      <header className="topbar">
        <Link to="/" className="brand">
          UniWORK
        </Link>

        {user ? (
          <nav className="nav">
            <NavLink to="/" end>
              Feed
            </NavLink>
            <NavLink to="/post">Post a Gig</NavLink>
            <NavLink to="/profile">Profile</NavLink>
            <button className="ghost-button" onClick={logout} type="button">
              Logout
            </button>
          </nav>
        ) : (
          <div className="auth-links">
            <Link to="/login">Login</Link>
            <Link to="/signup" className="primary-link">
              Sign up
            </Link>
          </div>
        )}
      </header>

      <main className="page-shell">
        <Outlet />
      </main>
    </div>
  );
}