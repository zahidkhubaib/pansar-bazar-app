import { Result, Button } from 'antd';
import { useSelector } from 'react-redux';
import { Link, Navigate, useLocation } from 'react-router-dom';

export default function ProtectedRoute({ children, admin = false }) {
  const { user, token } = useSelector((state) => state.auth);
  const location = useLocation();

  if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (admin && user?.role !== 'admin') {
    return (
      <Result
        status="403"
        title="Admin access required"
        subTitle="This area is only available to store administrators."
        extra={
          <Link to="/">
            <Button type="primary">Back to store</Button>
          </Link>
        }
      />
    );
  }

  return children;
}
