import { useState } from 'react';

const Profile = () => {
  const [userData, setUserData] = useState({
    name: 'John Doe',
    email: 'john.doe@example.com',
    phone: '+1 (555) 123-4567',
    currency: 'USD',
    language: 'English',
    notifications: true,
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setUserData({
      ...userData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle profile update logic here
    console.log(userData);
  };

  return (
    <div className="container mt-8">
      <div className="card">
        <div className="card-header">
          <h2 className="text-lg font-semibold">Profile Settings</h2>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div className="form-group">
              <label htmlFor="name" className="form-label">
                Full Name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                className="form-input"
                value={userData.name}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="email" className="form-label">
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="form-input"
                value={userData.email}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="phone" className="form-label">
                Phone Number
              </label>
              <input
                id="phone"
                name="phone"
                type="tel"
                className="form-input"
                value={userData.phone}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="currency" className="form-label">
                Preferred Currency
              </label>
              <select
                id="currency"
                name="currency"
                className="form-input"
                value={userData.currency}
                onChange={handleChange}
              >
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
                <option value="GBP">GBP (£)</option>
                <option value="JPY">JPY (¥)</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="language" className="form-label">
                Language
              </label>
              <select
                id="language"
                name="language"
                className="form-input"
                value={userData.language}
                onChange={handleChange}
              >
                <option value="English">English</option>
                <option value="Spanish">Spanish</option>
                <option value="French">French</option>
                <option value="German">German</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="flex items-center space-x-3">
              <input
                type="checkbox"
                name="notifications"
                checked={userData.notifications}
                onChange={handleChange}
                className="form-checkbox h-5 w-5 text-primary-color"
              />
              <span className="text-sm text-gray-700">Enable email notifications</span>
            </label>
          </div>

          <div className="flex justify-end space-x-4">
            <button type="button" className="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Profile; 