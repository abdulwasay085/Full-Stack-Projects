import { Link, useLocation, useNavigate } from 'react-router-dom';
import { supabase } from '../main';

const Navbar = ({ isAuthenticated }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const navItems = [
    { path: '/dashboard', label: 'Dashboard' },
    { path: '/add-expense', label: 'Add Expense' },
    { path: '/expense-history', label: 'Expense History' },
  ];

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      navigate('/login');
    } catch (error) {
      console.error('Error logging out:', error.message);
    }
  };

  return (
    <nav className="navbar">
      <div className="nav-container">
        <div className="nav-left">
          <Link to="/dashboard" className="nav-brand">
            Expense Tracker
          </Link>
          {isAuthenticated && (
            <div className="nav-links">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`nav-link ${location.pathname === item.path ? 'active' : ''}`}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          )}
        </div>
        {isAuthenticated && (
          <button onClick={handleLogout} className="btn btn-danger">
            Logout
          </button>
        )}
      </div>
    </nav>
  );
};

export default Navbar; 