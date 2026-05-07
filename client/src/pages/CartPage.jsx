import { DeleteOutlined, ShoppingOutlined } from '@ant-design/icons';
import { Button, Empty, InputNumber, Popconfirm, Space, Table, Typography } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import {
  removeFromCart,
  selectCartTotal,
  updateQuantity,
} from '../features/cart/cartSlice.js';
import { formatCurrency } from '../utils/format.js';
import { fallbackImage, getImageUrl } from '../utils/image.js';

const { Text, Title } = Typography;

export default function CartPage() {
  const dispatch = useDispatch();
  const items = useSelector((state) => state.cart.items);
  const total = useSelector(selectCartTotal);

  const columns = [
    {
      title: 'Product',
      dataIndex: 'name',
      render: (_, item) => (
        <Space>
          <img
            className="cart-thumb"
            src={getImageUrl(item.image)}
            alt={item.name}
            onError={(event) => {
              event.currentTarget.src = fallbackImage;
            }}
          />
          <div>
            <Link to={`/products/${item.slug || item.product}`}>
              <Text strong>{item.name}</Text>
            </Link>
            <div>
              <Text type="secondary">{item.unit}</Text>
            </div>
          </div>
        </Space>
      ),
    },
    {
      title: 'Price',
      dataIndex: 'price',
      render: (price) => formatCurrency(price),
      responsive: ['md'],
    },
    {
      title: 'Quantity',
      dataIndex: 'quantity',
      render: (_, item) => (
        <InputNumber
          min={1}
          max={item.stock || 99}
          value={item.quantity}
          onChange={(quantity) =>
            dispatch(updateQuantity({ product: item.product, quantity: quantity || 1 }))
          }
        />
      ),
    },
    {
      title: 'Subtotal',
      render: (_, item) => formatCurrency(item.price * item.quantity),
    },
    {
      title: '',
      render: (_, item) => (
        <Popconfirm title="Remove item?" onConfirm={() => dispatch(removeFromCart(item.product))}>
          <Button danger icon={<DeleteOutlined />} />
        </Popconfirm>
      ),
    },
  ];

  if (!items.length) {
    return (
      <section className="page-section">
        <Empty description="Your cart is empty">
          <Link to="/products">
            <Button type="primary" icon={<ShoppingOutlined />}>
              Browse products
            </Button>
          </Link>
        </Empty>
      </section>
    );
  }

  return (
    <section className="page-section">
      <div className="section-heading">
        <Title level={1}>Cart</Title>
      </div>
      <Table columns={columns} dataSource={items} rowKey="product" pagination={false} scroll={{ x: 720 }} />
      <div className="cart-summary">
        <Title level={3}>Total: {formatCurrency(total)}</Title>
        <Space wrap>
          <Link to="/products">
            <Button>Continue shopping</Button>
          </Link>
          <Link to="/checkout">
            <Button type="primary">Checkout</Button>
          </Link>
        </Space>
      </div>
    </section>
  );
}
