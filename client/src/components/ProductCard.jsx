import { ShoppingCartOutlined } from '@ant-design/icons';
import { Button, Card, Rate, Space, Tag, Typography, message } from 'antd';
import { Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { addToCart } from '../features/cart/cartSlice.js';
import { formatCurrency } from '../utils/format.js';
import { fallbackImage, getImageUrl } from '../utils/image.js';

const { Text, Title } = Typography;

export default function ProductCard({ product }) {
  const dispatch = useDispatch();

  const handleAdd = () => {
    dispatch(addToCart({ product, quantity: 1 }));
    message.success(`${product.name} added to cart`);
  };

  return (
    <Card
      className="product-card"
      cover={
        <Link to={`/products/${product.slug || product._id}`}>
          <img
            alt={product.name}
            src={getImageUrl(product.image?.url)}
            onError={(event) => {
              event.currentTarget.src = fallbackImage;
            }}
          />
        </Link>
      }
      actions={[
        <Button
          key="add"
          type="primary"
          icon={<ShoppingCartOutlined />}
          onClick={handleAdd}
          disabled={!product.stock}
        >
          {product.stock ? 'Add to cart' : 'Out of stock'}
        </Button>,
      ]}
    >
      <Space direction="vertical" size={8} className="full-width">
        <Link to={`/products/${product.slug || product._id}`}>
          <Title level={4}>{product.name}</Title>
        </Link>
        <Space wrap>
          <Tag>{product.category?.name || 'Herbal'}</Tag>
          <Text type="secondary">{product.unit}</Text>
        </Space>
        <Rate disabled allowHalf value={product.ratingAverage || 0} />
        <div className="product-card-footer">
          <Text strong>{formatCurrency(product.price)}</Text>
          <Text type="secondary">{product.stock} in stock</Text>
        </div>
      </Space>
    </Card>
  );
}
