import { DollarOutlined, OrderedListOutlined, TeamOutlined } from '@ant-design/icons';
import { Card, Col, Row, Space, Statistic, Table, Tag, Typography, message } from 'antd';
import { useEffect, useState } from 'react';
import { orderApi } from '../../api/services.js';
import LoadingState from '../../components/LoadingState.jsx';
import { formatCurrency, formatDate } from '../../utils/format.js';

const { Title } = Typography;

export default function AdminDashboardPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await orderApi.stats();
        setStats(data.stats);
      } catch (error) {
        message.error(error.response?.data?.message || 'Could not load dashboard');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  if (loading) {
    return <LoadingState label="Loading dashboard" />;
  }

  return (
    <Space direction="vertical" size={24} className="full-width">
      <Title level={1}>Dashboard</Title>
      <Row gutter={[16, 16]}>
        <Col xs={24} md={8}>
          <Card>
            <Statistic title="Orders" value={stats?.orders || 0} prefix={<OrderedListOutlined />} />
          </Card>
        </Col>
        <Col xs={24} md={8}>
          <Card>
            <Statistic title="Users" value={stats?.users || 0} prefix={<TeamOutlined />} />
          </Card>
        </Col>
        <Col xs={24} md={8}>
          <Card>
            <Statistic
              title="Revenue"
              value={stats?.revenue || 0}
              formatter={formatCurrency}
              prefix={<DollarOutlined />}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={14}>
          <Card title="Recent orders">
            <Table
              rowKey="_id"
              pagination={false}
              dataSource={stats?.recentOrders || []}
              columns={[
                { title: 'Order', dataIndex: '_id', render: (id) => id.slice(-8).toUpperCase() },
                { title: 'Customer', dataIndex: ['user', 'name'] },
                { title: 'Date', dataIndex: 'createdAt', render: formatDate },
                { title: 'Total', dataIndex: 'total', render: formatCurrency },
                { title: 'Status', dataIndex: 'status', render: (status) => <Tag>{status}</Tag> },
              ]}
              scroll={{ x: 720 }}
            />
          </Card>
        </Col>
        <Col xs={24} lg={10}>
          <Card title="Low stock">
            <Table
              rowKey="_id"
              pagination={false}
              dataSource={stats?.lowStockProducts || []}
              columns={[
                { title: 'Product', dataIndex: 'name' },
                { title: 'Stock', dataIndex: 'stock', render: (stock) => <Tag color="red">{stock}</Tag> },
              ]}
            />
          </Card>
        </Col>
      </Row>
    </Space>
  );
}
