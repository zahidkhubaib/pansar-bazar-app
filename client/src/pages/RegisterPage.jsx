import { Button, Form, Input, Typography, message } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { registerUser } from '../features/auth/authSlice.js';

const { Text, Title } = Typography;

export default function RegisterPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { status } = useSelector((state) => state.auth);

  const submit = async (values) => {
    try {
      await dispatch(registerUser(values)).unwrap();
      navigate('/');
    } catch (error) {
      message.error(error);
    }
  };

  return (
    <section className="auth-page">
      <div className="auth-panel">
        <Title level={1}>Create account</Title>
        <Form layout="vertical" onFinish={submit}>
          <Form.Item
            name="name"
            label="Name"
            rules={[{ required: true, message: 'Name is required' }]}
          >
            <Input autoComplete="name" />
          </Form.Item>
          <Form.Item
            name="email"
            label="Email"
            rules={[{ required: true, type: 'email', message: 'Valid email is required' }]}
          >
            <Input autoComplete="email" />
          </Form.Item>
          <Form.Item name="phone" label="Phone">
            <Input autoComplete="tel" />
          </Form.Item>
          <Form.Item
            name="password"
            label="Password"
            rules={[{ required: true, min: 6, message: 'Password must be 6+ characters' }]}
          >
            <Input.Password autoComplete="new-password" />
          </Form.Item>
          <Button type="primary" htmlType="submit" loading={status === 'loading'} block>
            Register
          </Button>
        </Form>
        <Text>
          Already registered? <Link to="/login">Login</Link>
        </Text>
      </div>
    </section>
  );
}
