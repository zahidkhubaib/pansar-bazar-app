import {
  AppstoreOutlined,
  DashboardOutlined,
  HomeOutlined,
  OrderedListOutlined,
  ShoppingOutlined,
  TeamOutlined,
} from '@ant-design/icons';
import { Layout, Menu } from 'antd';
import { Link, Outlet, useLocation } from 'react-router-dom';

const { Content, Sider } = Layout;

export default function AdminLayout() {
  const location = useLocation();

  const items = [
    { key: '/admin', icon: <DashboardOutlined />, label: <Link to="/admin">Dashboard</Link> },
    {
      key: '/admin/products',
      icon: <ShoppingOutlined />,
      label: <Link to="/admin/products">Products</Link>,
    },
    {
      key: '/admin/categories',
      icon: <AppstoreOutlined />,
      label: <Link to="/admin/categories">Categories</Link>,
    },
    {
      key: '/admin/orders',
      icon: <OrderedListOutlined />,
      label: <Link to="/admin/orders">Orders</Link>,
    },
    { key: '/admin/users', icon: <TeamOutlined />, label: <Link to="/admin/users">Users</Link> },
    { key: '/', icon: <HomeOutlined />, label: <Link to="/">Storefront</Link> },
  ];

  return (
    <Layout className="admin-shell">
      <Sider breakpoint="lg" collapsedWidth="0" className="admin-sider">
        <Link to="/admin" className="admin-brand">
          Pansar Bazar
        </Link>
        <Menu
          theme="dark"
          mode="inline"
          items={items}
          selectedKeys={[location.pathname]}
          className="admin-menu"
        />
      </Sider>
      <Layout>
        <Content className="admin-content">
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
}
