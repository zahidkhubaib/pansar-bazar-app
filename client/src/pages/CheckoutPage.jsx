import { WhatsAppOutlined } from '@ant-design/icons';
import {
  Alert,
  Button,
  Col,
  Empty,
  Form,
  Input,
  Radio,
  Result,
  Row,
  Space,
  Typography,
  message,
} from 'antd';
import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { orderApi } from '../api/services.js';
import { clearCart, selectCartTotal } from '../features/cart/cartSlice.js';
import { formatCurrency } from '../utils/format.js';

const { Text, Title } = Typography;

export default function CheckoutPage() {
  const [form] = Form.useForm();
  const dispatch = useDispatch();
  const items = useSelector((state) => state.cart.items);
  const total = useSelector(selectCartTotal);
  const { user } = useSelector((state) => state.auth);
  const [placing, setPlacing] = useState(false);
  const [order, setOrder] = useState(null);

  const placeOrder = async (values) => {
    setPlacing(true);
    try {
      const payload = {
        items: items.map((item) => ({
          product: item.product,
          quantity: item.quantity,
        })),
        address: values.address,
        paymentMethod: values.paymentMethod,
      };
      const data = await orderApi.create(payload);
      setOrder(data.order);
      dispatch(clearCart());
      message.success('Order placed successfully');
    } catch (error) {
      message.error(error.response?.data?.message || 'Could not place order');
    } finally {
      setPlacing(false);
    }
  };

  if (order) {
    return (
      <section className="page-section">
        <Result
          status="success"
          title="Order placed"
          subTitle={`Order #${order._id} has been created. Total ${formatCurrency(order.total)}.`}
          extra={[
            order.whatsappUrl ? (
              <a href={order.whatsappUrl} target="_blank" rel="noreferrer" key="whatsapp">
                <Button type="primary" icon={<WhatsAppOutlined />}>
                  Send on WhatsApp
                </Button>
              </a>
            ) : null,
            <Link to="/profile" key="profile">
              <Button>View orders</Button>
            </Link>,
          ]}
        />
      </section>
    );
  }

  if (!items.length) {
    return (
      <section className="page-section">
        <Empty description="Your cart is empty">
          <Link to="/products">
            <Button type="primary">Shop products</Button>
          </Link>
        </Empty>
      </section>
    );
  }

  return (
    <section className="page-section">
      <div className="section-heading">
        <Title level={1}>Checkout</Title>
      </div>
      <Row gutter={[32, 32]}>
        <Col xs={24} md={15}>
          <Form
            form={form}
            layout="vertical"
            onFinish={placeOrder}
            initialValues={{
              paymentMethod: 'COD',
              address: {
                name: user?.name,
                phone: user?.phone,
                country: 'Pakistan',
              },
            }}
          >
            <Title level={3}>Delivery address</Title>
            <Row gutter={16}>
              <Col xs={24} sm={12}>
                <Form.Item
                  name={['address', 'name']}
                  label="Full name"
                  rules={[{ required: true, message: 'Name is required' }]}
                >
                  <Input />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12}>
                <Form.Item
                  name={['address', 'phone']}
                  label="Phone"
                  rules={[{ required: true, message: 'Phone is required' }]}
                >
                  <Input />
                </Form.Item>
              </Col>
              <Col xs={24}>
                <Form.Item
                  name={['address', 'line1']}
                  label="Address"
                  rules={[{ required: true, message: 'Address is required' }]}
                >
                  <Input />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12}>
                <Form.Item
                  name={['address', 'city']}
                  label="City"
                  rules={[{ required: true, message: 'City is required' }]}
                >
                  <Input />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12}>
                <Form.Item name={['address', 'postalCode']} label="Postal code">
                  <Input />
                </Form.Item>
              </Col>
              <Col xs={24}>
                <Form.Item name={['address', 'notes']} label="Order notes">
                  <Input.TextArea rows={3} />
                </Form.Item>
              </Col>
            </Row>

            <Title level={3}>Payment</Title>
            <Form.Item name="paymentMethod">
              <Radio.Group>
                <Radio.Button value="COD">Cash on delivery</Radio.Button>
              </Radio.Group>
            </Form.Item>
            <Alert
              type="info"
              showIcon
              message="You can confirm this order with the store on WhatsApp after placing it."
            />
            <Button type="primary" htmlType="submit" loading={placing} className="checkout-button">
              Place order
            </Button>
          </Form>
        </Col>
        <Col xs={24} md={9}>
          <aside className="order-summary">
            <Title level={3}>Order summary</Title>
            <Space direction="vertical" className="full-width">
              {items.map((item) => (
                <div className="summary-line" key={item.product}>
                  <Text>
                    {item.name} x {item.quantity}
                  </Text>
                  <Text>{formatCurrency(item.price * item.quantity)}</Text>
                </div>
              ))}
              <div className="summary-total">
                <Text strong>Total</Text>
                <Text strong>{formatCurrency(total)}</Text>
              </div>
            </Space>
          </aside>
        </Col>
      </Row>
    </section>
  );
}
