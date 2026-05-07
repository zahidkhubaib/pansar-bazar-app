import { Button, Descriptions, Form, Input, Space, Table, Tag, Typography, message } from 'antd';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { orderApi } from '../api/services.js';
import { saveProfile } from '../features/auth/authSlice.js';
import { formatCurrency, formatDate } from '../utils/format.js';

const { Title } = Typography;

export default function ProfilePage() {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadOrders = async () => {
      try {
        const data = await orderApi.userOrders();
        setOrders(data.orders);
      } catch (error) {
        message.error(error.response?.data?.message || 'Could not load orders');
      } finally {
        setLoading(false);
      }
    };

    loadOrders();
  }, []);

  const updateProfile = async (values) => {
    try {
      await dispatch(saveProfile(values)).unwrap();
      message.success('Profile updated');
    } catch (error) {
      message.error(error);
    }
  };

  const columns = [
    {
      title: 'Order',
      dataIndex: '_id',
      render: (id) => id.slice(-8).toUpperCase(),
    },
    {
      title: 'Date',
      dataIndex: 'createdAt',
      render: formatDate,
      responsive: ['md'],
    },
    {
      title: 'Total',
      dataIndex: 'total',
      render: formatCurrency,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      render: (status) => <Tag>{status}</Tag>,
    },
    {
      title: 'Items',
      dataIndex: 'items',
      render: (items) => items.map((item) => `${item.name} x${item.quantity}`).join(', '),
    },
  ];

  return (
    <section className="page-section">
      <div className="section-heading">
        <Title level={1}>Profile</Title>
      </div>

      <Space direction="vertical" size={32} className="full-width">
        <Descriptions bordered column={{ xs: 1, sm: 2 }}>
          <Descriptions.Item label="Name">{user?.name}</Descriptions.Item>
          <Descriptions.Item label="Email">{user?.email}</Descriptions.Item>
          <Descriptions.Item label="Phone">{user?.phone || 'Not added'}</Descriptions.Item>
          <Descriptions.Item label="Role">{user?.role}</Descriptions.Item>
        </Descriptions>

        <div className="profile-grid">
          <div>
            <Title level={3}>Account details</Title>
            <Form
              layout="vertical"
              initialValues={{ name: user?.name, phone: user?.phone }}
              onFinish={updateProfile}
            >
              <Form.Item name="name" label="Name" rules={[{ required: true }]}>
                <Input />
              </Form.Item>
              <Form.Item name="phone" label="Phone">
                <Input />
              </Form.Item>
              <Button type="primary" htmlType="submit">
                Save changes
              </Button>
            </Form>
          </div>
          <div>
            <Title level={3}>Order history</Title>
            <Table
              columns={columns}
              dataSource={orders}
              rowKey="_id"
              loading={loading}
              scroll={{ x: 760 }}
            />
          </div>
        </div>
      </Space>
    </section>
  );
}
