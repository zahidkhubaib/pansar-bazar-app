import { Button, Select, Space, Table, Tag, Typography, message } from 'antd';
import { useEffect, useState } from 'react';
import { orderApi } from '../../api/services.js';
import { formatCurrency, formatDate } from '../../utils/format.js';

const { Title } = Typography;

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const data = await orderApi.adminOrders();
      setOrders(data.orders);
    } catch (error) {
      message.error(error.response?.data?.message || 'Could not load orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const update = async (order, values) => {
    try {
      await orderApi.updateStatus(order._id, values);
      message.success('Order updated');
      await load();
    } catch (error) {
      message.error(error.response?.data?.message || 'Could not update order');
    }
  };

  return (
    <Space direction="vertical" size={20} className="full-width">
      <Title level={1}>Orders</Title>
      <Table
        rowKey="_id"
        loading={loading}
        dataSource={orders}
        scroll={{ x: 1120 }}
        expandable={{
          expandedRowRender: (order) => (
            <Space direction="vertical">
              <span>{order.items.map((item) => `${item.name} x${item.quantity}`).join(', ')}</span>
              <span>
                {order.address.line1}, {order.address.city} - {order.address.phone}
              </span>
              {order.whatsappUrl ? (
                <a href={order.whatsappUrl} target="_blank" rel="noreferrer">
                  <Button>Open WhatsApp message</Button>
                </a>
              ) : null}
            </Space>
          ),
        }}
        columns={[
          { title: 'Order', dataIndex: '_id', render: (id) => id.slice(-8).toUpperCase() },
          { title: 'Customer', dataIndex: ['user', 'name'] },
          { title: 'Date', dataIndex: 'createdAt', render: formatDate },
          { title: 'Total', dataIndex: 'total', render: formatCurrency },
          {
            title: 'Payment',
            dataIndex: 'paymentStatus',
            render: (paymentStatus, order) => (
              <Select
                value={paymentStatus}
                onChange={(value) => update(order, { paymentStatus: value })}
                options={[
                  { value: 'unpaid', label: 'Unpaid' },
                  { value: 'paid', label: 'Paid' },
                  { value: 'refunded', label: 'Refunded' },
                ]}
              />
            ),
          },
          {
            title: 'Status',
            dataIndex: 'status',
            render: (status, order) => (
              <Select
                value={status}
                onChange={(value) => update(order, { status: value })}
                options={[
                  { value: 'pending', label: 'Pending' },
                  { value: 'processing', label: 'Processing' },
                  { value: 'shipped', label: 'Shipped' },
                  { value: 'delivered', label: 'Delivered' },
                  { value: 'cancelled', label: 'Cancelled' },
                ]}
              />
            ),
          },
          { title: 'Method', dataIndex: 'paymentMethod', render: (method) => <Tag>{method}</Tag> },
        ]}
      />
    </Space>
  );
}
