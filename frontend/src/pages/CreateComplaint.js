import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { createComplaint } from '../api/complaints.js';

const CreateComplaint = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Electrical');
  const [location, setLocation] = useState('');
  const [priority, setPriority] = useState('Medium');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const navigate = useNavigate();

  const categories = ['Electrical', 'Plumbing', 'Cleaning', 'Internet', 'Furniture', 'Other'];
  const priorities = ['Low', 'Medium', 'High', 'Critical'];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!title.trim() || !description.trim() || !category || !location.trim()) {
      setError('Please fill in all required fields.');
      return;
    }

    setSubmitting(true);
    try {
      const response = await createComplaint({
        title: title.trim(),
        description: description.trim(),
        category,
        location: location.trim(),
        priority,
      });

      // Redirect to the newly created complaint or list
      if (response.complaint?._id) {
        navigate(`/complaints/${response.complaint._id}`);
      } else {
        navigate('/complaints');
      }
    } catch (err) {
      console.error('Submission error:', err);
      setError(
        err.response?.data?.message || 'Failed to file complaint. Please verify server connection.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.header}>
          <Link to="/complaints" style={styles.backLink}>
            ← Back to All Tickets
          </Link>
          <h1 style={styles.title}>File a Maintenance Complaint</h1>
          <p style={styles.subtitle}>
            Submit your issue and our facilities maintenance team will address it promptly.
          </p>
        </div>

        {error && <div style={styles.errorBox}>{error}</div>}

        <form onSubmit={handleSubmit} style={styles.form}>
          {/* Title */}
          <div style={styles.formGroup}>
            <label htmlFor="title" style={styles.label}>
              Issue Title <span style={styles.required}>*</span>
            </label>
            <input
              id="title"
              type="text"
              placeholder="e.g. Water leak under sink in 2nd floor restroom"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              style={styles.input}
            />
          </div>

          {/* Category & Priority Grid */}
          <div style={styles.row}>
            <div style={styles.formGroup}>
              <label htmlFor="category" style={styles.label}>
                Category <span style={styles.required}>*</span>
              </label>
              <select
                id="category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                style={styles.select}
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div style={styles.formGroup}>
              <label htmlFor="priority" style={styles.label}>
                Priority Level
              </label>
              <select
                id="priority"
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                style={styles.select}
              >
                {priorities.map((pri) => (
                  <option key={pri} value={pri}>
                    {pri}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Location */}
          <div style={styles.formGroup}>
            <label htmlFor="location" style={styles.label}>
              Location / Room / Area <span style={styles.required}>*</span>
            </label>
            <input
              id="location"
              type="text"
              placeholder="e.g. Science Lab B, Station 4, 3rd Floor"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              required
              style={styles.input}
            />
          </div>

          {/* Description */}
          <div style={styles.formGroup}>
            <label htmlFor="description" style={styles.label}>
              Detailed Description <span style={styles.required}>*</span>
            </label>
            <textarea
              id="description"
              rows={5}
              placeholder="Provide any specific details that will help the technician fix the problem quickly..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              style={styles.textarea}
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={submitting}
            style={{
              ...styles.submitBtn,
              opacity: submitting ? 0.7 : 1,
              cursor: submitting ? 'not-allowed' : 'pointer',
            }}
          >
            {submitting ? 'Submitting Ticket...' : 'Submit Maintenance Ticket'}
          </button>
        </form>
      </div>
    </div>
  );
};

const styles = {
  container: {
    maxWidth: '740px',
    margin: '0 auto',
    padding: '30px 20px 60px 20px',
    fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
    color: '#f8fafc',
  },
  card: {
    backgroundColor: '#1e293b',
    border: '1px solid #334155',
    borderRadius: '16px',
    padding: '36px',
    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)',
  },
  header: {
    marginBottom: '28px',
  },
  backLink: {
    display: 'inline-block',
    color: '#60a5fa',
    textDecoration: 'none',
    fontSize: '13px',
    fontWeight: '600',
    marginBottom: '14px',
  },
  title: {
    fontSize: '26px',
    fontWeight: '800',
    color: '#ffffff',
    margin: '0 0 8px 0',
  },
  subtitle: {
    fontSize: '14px',
    color: '#94a3b8',
    margin: 0,
    lineHeight: '1.5',
  },
  errorBox: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    border: '1px solid #ef4444',
    color: '#fca5a5',
    padding: '12px 16px',
    borderRadius: '8px',
    fontSize: '13px',
    marginBottom: '24px',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    flex: 1,
  },
  row: {
    display: 'flex',
    gap: '16px',
    flexWrap: 'wrap',
  },
  label: {
    fontSize: '13px',
    fontWeight: '600',
    color: '#cbd5e1',
  },
  required: {
    color: '#ef4444',
  },
  input: {
    backgroundColor: '#0f172a',
    border: '1px solid #334155',
    borderRadius: '8px',
    padding: '12px 14px',
    color: '#ffffff',
    fontSize: '14px',
    outline: 'none',
  },
  select: {
    backgroundColor: '#0f172a',
    border: '1px solid #334155',
    borderRadius: '8px',
    padding: '12px 14px',
    color: '#ffffff',
    fontSize: '14px',
    outline: 'none',
    cursor: 'pointer',
  },
  textarea: {
    backgroundColor: '#0f172a',
    border: '1px solid #334155',
    borderRadius: '8px',
    padding: '12px 14px',
    color: '#ffffff',
    fontSize: '14px',
    outline: 'none',
    fontFamily: 'inherit',
    resize: 'vertical',
  },
  submitBtn: {
    backgroundColor: '#2563eb',
    color: '#ffffff',
    border: 'none',
    borderRadius: '8px',
    padding: '14px',
    fontSize: '15px',
    fontWeight: '700',
    marginTop: '10px',
  },
};

export default CreateComplaint;
