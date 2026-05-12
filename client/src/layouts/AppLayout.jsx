import {
  LoginOutlined,
  LogoutOutlined,
  MenuOutlined,
  SearchOutlined,
  ShoppingCartOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { Badge, Button, Drawer, Dropdown, Grid, Input, Layout, Menu, Space } from 'antd';
import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import { logout } from '../features/auth/authSlice.js';
import { selectCartCount } from '../features/cart/cartSlice.js';

const { Header, Content, Footer } = Layout;
const { useBreakpoint } = Grid;

export default function AppLayout() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const screens = useBreakpoint();
  const { user } = useSelector((state) => state.auth);
  const cartCount = useSelector(selectCartCount);

  const navItems = [
    { key: '/', label: <Link to="/">Home</Link> },
    { key: '/products', label: <Link to="/products">Products</Link> },
    ...(user?.role === 'admin'
      ? [{ key: '/admin', label: <Link to="/admin">Admin</Link> }]
      : []),
  ];

  const accountItems = user
    ? [
        { key: 'profile', icon: <UserOutlined />, label: <Link to="/profile">Profile</Link> },
        {
          key: 'logout',
          icon: <LogoutOutlined />,
          label: 'Logout',
          onClick: () => {
            dispatch(logout());
            navigate('/');
          },
        },
      ]
    : [
        { key: 'login', icon: <LoginOutlined />, label: <Link to="/login">Login</Link> },
        { key: 'register', icon: <UserOutlined />, label: <Link to="/register">Register</Link> },
      ];

  const submitSearch = (value) => {
    const term = value.trim();
    navigate(term ? `/products?search=${encodeURIComponent(term)}` : '/products');
    setDrawerOpen(false);
  };

  const nav = <Menu mode={screens.md ? 'horizontal' : 'vertical'} items={navItems} selectable={false} />;

  return (
    <Layout className="site-shell">
      <Header className="site-header">
        <Link to="/" className="brand">
          {/* <span className="brand-mark">PB</span> */}
          <img height={70} width={100} src="/images/logo.png" alt="Pansar Bazar Logo" className="brand-logo" />
          {/* <span>Pansar Bazar</span> */}
        </Link>

        {screens.md ? (
          <>
            <div className="desktop-nav">{nav}</div>
            <Input.Search
              className="header-search"
              placeholder="Search herbs, spices, oils"
              enterButton={<SearchOutlined />}
              onSearch={submitSearch}
              allowClear
            />
          </>
        ) : (
          <Button icon={<MenuOutlined />} onClick={() => setDrawerOpen(true)} />
        )}

        <Space className="header-actions">
          <Link to="/cart">
            <Badge count={cartCount} size="small">
              <Button icon={<ShoppingCartOutlined />} />
            </Badge>
          </Link>
          <Dropdown menu={{ items: accountItems }} placement="bottomRight">
            <Button icon={<UserOutlined />}>{screens.sm && (user ? user.name : 'Account')}</Button>
          </Dropdown>
        </Space>
      </Header>

      <Drawer open={drawerOpen} onClose={() => setDrawerOpen(false)} title="Pansar Bazar">
        <Space direction="vertical" size={16} className="full-width">
          <Input.Search placeholder="Search products" onSearch={submitSearch} allowClear />
          {nav}
        </Space>
      </Drawer>

      <Content>
        <Outlet />
      </Content>

      <Footer className="site-footer">
        <div>
          <strong>Pansar Bazar</strong>
          <p>Quality herbs, spices, seeds, oils, and traditional pansari essentials.</p>
        </div>
        <div>
          <strong>Contact</strong>
          <p>WhatsApp: +92 300 7574363</p>
          <p>Email: pansarbazar@gmail.com</p>
        </div>
        <div>
          <strong>Store</strong>
          <p>Open daily, 10:00 AM - 9:00 PM</p>
          <p>Cash on delivery available.</p>
        </div>
      </Footer>
    </Layout>
  );
}
