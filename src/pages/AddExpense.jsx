import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../main';

const AddExpense = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});

  const [formData, setFormData] = useState({
    title: '',
    amount: '',
    category: '',
    date: new Date().toISOString().split('T')[0],
    description: ''
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

  const validateForm = () => {
    const errors = {};
    
    if (!formData.title.trim()) {
      errors.title = 'Title is required';
    } else if (formData.title.length > 100) {
      errors.title = 'Title must be less than 100 characters';
    }

    if (!formData.amount) {
      errors.amount = 'Amount is required';
    } else {
      const amount = parseFloat(formData.amount);
      if (isNaN(amount) || amount <= 0) {
        errors.amount = 'Amount must be a positive number';
      } else if (amount > 1000000) {
        errors.amount = 'Amount cannot exceed 1,000,000';
      }
    }

    if (!formData.category) {
      errors.category = 'Category is required';
    }

    if (!formData.date) {
      errors.date = 'Date is required';
    }

    if (formData.description && formData.description.length > 500) {
      errors.description = 'Description must be less than 500 characters';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear validation error when user starts typing
    if (validationErrors[name]) {
      setValidationErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      console.log('Getting user...');
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError) {
        console.error('User error:', userError);
        throw userError;
      }
      
      if (!user) {
        console.error('No user found');
        throw new Error('Please login to add expenses');
      }

      console.log('Preparing expense data...');
      const expenseData = {
        user_id: user.id,
        title: formData.title.trim(),
        amount: parseFloat(formData.amount),
        category: formData.category,
        date: formData.date,
        description: formData.description.trim(),
        created_at: new Date().toISOString()
      };
      
      console.log('Inserting expense:', expenseData);
      const { data: insertedData, error: insertError } = await supabase
        .from('expenses')
        .insert([expenseData])
        .select();

      if (insertError) {
        console.error('Insert error:', insertError);
        throw insertError;
      }

      console.log('Expense added successfully:', insertedData);
      alert('Expense added successfully!');
      
      // Redirect to expense history after successful addition
      navigate('/expense-history');
    } catch (error) {
      console.error('Error in handleSubmit:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <div className="card" style={{ maxWidth: '600px', margin: '0 auto' }}>
        <div className="card-header">
          <h2 className="card-title">Add New Expense</h2>
        </div>
        {error && (
          <div className="alert alert-error">
            <span>{error}</span>
          </div>
        )}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="title" className="form-label">
              Expense Title
            </label>
            <input
              id="title"
              name="title"
              type="text"
              required
              className={`form-input ${validationErrors.title ? 'input-error' : ''}`}
              placeholder="Enter expense title"
              value={formData.title}
              onChange={handleChange}
            />
            {validationErrors.title && (
              <div className="error-message">{validationErrors.title}</div>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="amount" className="form-label">
              Amount
            </label>
            <input
              id="amount"
              name="amount"
              type="number"
              step="0.01"
              required
              className={`form-input ${validationErrors.amount ? 'input-error' : ''}`}
              placeholder="Enter amount"
              value={formData.amount}
              onChange={handleChange}
            />
            {validationErrors.amount && (
              <div className="error-message">{validationErrors.amount}</div>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="category" className="form-label">
              Category
            </label>
            <select
              id="category"
              name="category"
              required
              className={`form-input ${validationErrors.category ? 'input-error' : ''}`}
              value={formData.category}
              onChange={handleChange}
            >
              <option value="">Select a category</option>
              {categories.map(category => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
            {validationErrors.category && (
              <div className="error-message">{validationErrors.category}</div>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="date" className="form-label">
              Date
            </label>
            <input
              id="date"
              name="date"
              type="date"
              required
              className={`form-input ${validationErrors.date ? 'input-error' : ''}`}
              value={formData.date}
              onChange={handleChange}
            />
            {validationErrors.date && (
              <div className="error-message">{validationErrors.date}</div>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="description" className="form-label">
              Description (Optional)
            </label>
            <textarea
              id="description"
              name="description"
              className={`form-input ${validationErrors.description ? 'input-error' : ''}`}
              placeholder="Enter description"
              value={formData.description}
              onChange={handleChange}
              rows="3"
            ></textarea>
            {validationErrors.description && (
              <div className="error-message">{validationErrors.description}</div>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary w-full"
          >
            {loading ? 'Adding Expense...' : 'Add Expense'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddExpense; 