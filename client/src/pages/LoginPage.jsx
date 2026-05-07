import { Button, Form, Input, Typography, message } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { loginUser } from '../features/auth/authSlice.js';

const { Text, Title } = Typography;

export default function LoginPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { status } = useSelector((state) => state.auth);
  const redirectTo = location.state?.from?.pathname || '/';

  const submit = async (values) => {
    try {
      const result = await dispatch(loginUser(values)).unwrap();
      navigate(result.user.role === 'admin' ? '/admin' : redirectTo, { replace: true });
    } catch (error) {
      message.error(error);
    }
  };

  return (
    <section className="auth-page">
      <div className="auth-panel">
        <Title level={1}>Login</Title>
        <Form layout="vertical" onFinish={submit}>
          <Form.Item
            name="email"
            label="Email"
            rules={[{ required: true, type: 'email', message: 'Valid email is required' }]}
          >
            <Input autoComplete="email" />
          </Form.Item>
          <Form.Item
            name="password"
            label="Password"
            rules={[{ required: true, message: 'Password is required' }]}
          >
            <Input.Password autoComplete="current-password" />
          </Form.Item>
          <Button type="primary" htmlType="submit" loading={status === 'loading'} block>
            Login
          </Button>
        </Form>
        <Text>
          New customer? <Link to="/register">Create an account</Link>
        </Text>
      </div>
    </section>
  );
}
