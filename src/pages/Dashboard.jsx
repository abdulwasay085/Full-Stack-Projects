import { useState, useEffect } from 'react';
import { supabase } from '../main';

const Dashboard = () => {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [income, setIncome] = useState(() => {
    const stored = localStorage.getItem('user_income');
    return stored ? parseFloat(stored) : 0;
  });
  const [incomeInput, setIncomeInput] = useState(income);
  const [savingIncome, setSavingIncome] = useState(false);

  // Fetch expenses and subscribe to real-time updates
  useEffect(() => {
    let subscription;
    let userId;
    const fetchAndSubscribe = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setError('Please login to view dashboard');
        setLoading(false);
        return;
      }
      userId = user.id;
      // Initial fetch
      const { data, error } = await supabase
        .from('expenses')
        .select('*')
        .eq('user_id', user.id);
      if (error) {
        setError(error.message);
        setLoading(false);
        return;
      }
      setExpenses(data || []);
      setLoading(false);
      // Real-time subscription
      subscription = supabase
        .channel('public:expenses')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'expenses', filter: `user_id=eq.${user.id}` }, (payload) => {
          if (payload.eventType === 'INSERT') {
            setExpenses((prev) => [...prev, payload.new]);
          } else if (payload.eventType === 'DELETE') {
            setExpenses((prev) => prev.filter(exp => exp.id !== payload.old.id));
          } else if (payload.eventType === 'UPDATE') {
            setExpenses((prev) => prev.map(exp => exp.id === payload.new.id ? payload.new : exp));
          }
        })
        .subscribe();
    };
    fetchAndSubscribe();
    return () => {
      if (subscription) supabase.removeChannel(subscription);
    };
  }, []);

  // Calculate monthly data
  const monthlyData = (() => {
    const map = {};
    expenses.forEach(exp => {
      const date = new Date(exp.date);
      const month = date.toLocaleString('default', { month: 'long', year: 'numeric' });
      if (!map[month]) map[month] = { month, income: 0, expenses: 0 };
      map[month].expenses += Number(exp.amount);
    });
    // Sort by date descending
    return Object.values(map).sort((a, b) => new Date(b.month) - new Date(a.month));
  })();

  // Calculate summary
  const totalExpenses = expenses.reduce((sum, exp) => sum + Number(exp.amount), 0);
  const totalIncome = income;
  const totalBalance = Math.abs(totalIncome - totalExpenses);
  const isNegativeBalance = totalIncome - totalExpenses < 0;

  // Recent expenses (last 5)
  const recentExpenses = [...expenses]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 5);

  const handleIncomeSave = () => {
    setSavingIncome(true);
    setIncome(incomeInput);
    localStorage.setItem('user_income', incomeInput);
    setTimeout(() => setSavingIncome(false), 500);
  };

  if (loading) {
    return <div className="container"><div className="card"><div>Loading dashboard...</div></div></div>;
  }
  if (error) {
    return <div className="container"><div className="card"><div className="alert alert-error">{error}</div></div></div>;
  }

  return (
    <div className="container">
      <div className="grid grid-3">
        {/* Total Income Card */}
        <div className="card stats-card">
          <div className="stats-icon" style={{ background: 'var(--gradient-success)' }}>
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <div className="stats-content">
            <h3>Total Income</h3>
            <div className="value text-success">${totalIncome}</div>
            <div style={{ marginTop: '0.5rem' }}>
              <input
                type="number"
                value={incomeInput}
                onChange={e => setIncomeInput(Number(e.target.value))}
                className="form-input"
                style={{ width: '120px', marginRight: '0.5rem' }}
                min="0"
              />
              <button
                className="btn btn-primary"
                onClick={handleIncomeSave}
                disabled={savingIncome}
                style={{ fontSize: '0.9rem', padding: '0.4rem 1rem' }}
              >
                {savingIncome ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </div>

        {/* Total Expenses Card */}
        <div className="card stats-card">
          <div className="stats-icon" style={{ background: 'var(--gradient-danger)' }}>
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 12H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <div className="stats-content">
            <h3>Total Expenses</h3>
            <div className="value text-danger">${totalExpenses}</div>
          </div>
        </div>

        {/* Total Balance Card */}
        <div className="card stats-card">
          <div className="stats-icon" style={{ background: 'var(--gradient-primary)' }}>
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
              />
            </svg>
          </div>
          <div className="stats-content">
            <h3>Total Balance</h3>
            <div className="value text-primary">${totalBalance}</div>
            {isNegativeBalance && (
              <div className="alert alert-error" style={{ marginTop: '0.5rem' }}>
                Warning: Your expenses exceed your income!
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="grid grid-2 mt-4">
        {/* Monthly Summary */}
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Monthly Summary</h2>
          </div>
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Month</th>
                  <th>Income</th>
                  <th>Expenses</th>
                  <th>Balance</th>
                </tr>
              </thead>
              <tbody>
                {monthlyData.map((month) => (
                  <tr key={month.month}>
                    <td>{month.month}</td>
                    <td className="text-success">${month.income}</td>
                    <td className="text-danger">${month.expenses}</td>
                    <td className="text-primary">${Math.abs(month.income - month.expenses)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        {/* Recent Expenses */}
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Recent Expenses</h2>
          </div>
          <div className="expense-list">
            {recentExpenses.map((expense) => (
              <div key={expense.id} className="expense-item">
                <div className="expense-info">
                  <div className="expense-icon">
                    {expense.category.charAt(0)}
                  </div>
                  <div className="expense-details">
                    <h4>{expense.title}</h4>
                    <p>{new Date(expense.date).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="expense-amount">
                  ${Number(expense.amount).toFixed(2)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 