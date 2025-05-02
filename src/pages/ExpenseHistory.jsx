import { useState, useEffect } from 'react';
import { supabase } from '../main';

const ExpenseHistory = () => {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    category: '',
    sortBy: 'date',
    sortOrder: 'desc'
  });

  const categories = [
    'Food & Dining',
    'Transportation',
    'Shopping',
    'Entertainment',
    'Bills & Utilities',
    'Healthcare',
    'Travel',
    'Education',
    'Other'
  ];

  useEffect(() => {
    fetchExpenses();
  }, [filters]);

  const fetchExpenses = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) throw new Error('Please login to view expenses');

      let query = supabase
        .from('expenses')
        .select('*')
        .eq('user_id', user.id);

      // Apply filters
      if (filters.startDate) {
        query = query.gte('date', filters.startDate);
      }
      if (filters.endDate) {
        query = query.lte('date', filters.endDate);
      }
      if (filters.category) {
        query = query.eq('category', filters.category);
      }

      // Apply sorting
      query = query.order(filters.sortBy, { ascending: filters.sortOrder === 'asc' });

      const { data, error } = await query;

      if (error) throw error;

      setExpenses(data || []);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatAmount = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const getCategoryTotal = (category) => {
    return expenses
      .filter(expense => expense.category === category)
      .reduce((sum, expense) => sum + expense.amount, 0);
  };

  // Add this function to handle deleting an expense
  const handleDelete = async (expenseId) => {
    if (!window.confirm('Are you sure you want to delete this expense?')) return;
    try {
      const { error } = await supabase
        .from('expenses')
        .delete()
        .eq('id', expenseId);
      if (error) throw error;
      setExpenses(expenses.filter(exp => exp.id !== expenseId));
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) {
    return (
      <div className="container">
        <div className="card">
          <div className="text-center">Loading expenses...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Expense History</h2>
        </div>
        
        {error && (
          <div className="alert alert-error">
            <span>{error}</span>
          </div>
        )}

        <div className="filters-section">
          <div className="grid grid-4 gap-4">
            <div className="form-group">
              <label htmlFor="startDate" className="form-label">Start Date</label>
              <input
                type="date"
                id="startDate"
                name="startDate"
                className="form-input"
                value={filters.startDate}
                onChange={handleFilterChange}
              />
            </div>
            <div className="form-group">
              <label htmlFor="endDate" className="form-label">End Date</label>
              <input
                type="date"
                id="endDate"
                name="endDate"
                className="form-input"
                value={filters.endDate}
                onChange={handleFilterChange}
              />
            </div>
            <div className="form-group">
              <label htmlFor="category" className="form-label">Category</label>
              <select
                id="category"
                name="category"
                className="form-input"
                value={filters.category}
                onChange={handleFilterChange}
              >
                <option value="">All Categories</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="sortBy" className="form-label">Sort By</label>
              <select
                id="sortBy"
                name="sortBy"
                className="form-input"
                value={filters.sortBy}
                onChange={handleFilterChange}
              >
                <option value="date">Date</option>
                <option value="amount">Amount</option>
                <option value="category">Category</option>
              </select>
              <select
                name="sortOrder"
                className="form-input mt-2"
                value={filters.sortOrder}
                onChange={handleFilterChange}
              >
                <option value="desc">Descending</option>
                <option value="asc">Ascending</option>
              </select>
            </div>
          </div>
        </div>

        {expenses.length === 0 ? (
          <div className="text-center text-secondary mt-4">
            No expenses found. Start by adding some expenses!
          </div>
        ) : (
          <div className="expense-list">
            {expenses.map((expense) => (
              <div key={expense.id} className="expense-item">
                <div className="expense-info">
                  <div className="expense-icon">
                    {expense.category[0]}
                  </div>
                  <div className="expense-details">
                    <h4>{expense.title}</h4>
                    <p>{formatDate(expense.date)}</p>
                    <span className="badge">{expense.category}</span>
                    {expense.description && (
                      <p className="text-secondary">{expense.description}</p>
                    )}
                  </div>
                </div>
                <div className="expense-amount">
                  {formatAmount(expense.amount)}
                  <button
                    className="btn btn-danger ml-2"
                    style={{ marginLeft: '10px', fontSize: '0.8rem', padding: '0.25rem 0.75rem' }}
                    onClick={() => handleDelete(expense.id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {expenses.length > 0 && (
        <>
          <div className="card mt-4">
            <div className="card-header">
              <h3 className="card-title">Summary</h3>
            </div>
            <div className="grid grid-2">
              <div className="stats-card">
                <div className="stats-icon" style={{ background: 'var(--gradient-primary)' }}>
                  <span>💰</span>
                </div>
                <div className="stats-content">
                  <h3>Total Expenses</h3>
                  <div className="value text-danger">
                    {formatAmount(expenses.reduce((sum, expense) => sum + expense.amount, 0))}
                  </div>
                </div>
              </div>
              <div className="stats-card">
                <div className="stats-icon" style={{ background: 'var(--gradient-success)' }}>
                  <span>📊</span>
                </div>
                <div className="stats-content">
                  <h3>Total Transactions</h3>
                  <div className="value text-primary">{expenses.length}</div>
                </div>
              </div>
            </div>
          </div>

          <div className="card mt-4">
            <div className="card-header">
              <h3 className="card-title">Category Breakdown</h3>
            </div>
            <div className="category-breakdown">
              {categories.map(category => {
                const total = getCategoryTotal(category);
                if (total === 0) return null;
                return (
                  <div key={category} className="category-item">
                    <div className="category-info">
                      <span className="category-name">{category}</span>
                      <span className="category-amount">{formatAmount(total)}</span>
                    </div>
                    <div className="category-bar">
                      <div
                        className="category-progress"
                        style={{
                          width: `${(total / expenses.reduce((sum, exp) => sum + exp.amount, 0)) * 100}%`
                        }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ExpenseHistory; 