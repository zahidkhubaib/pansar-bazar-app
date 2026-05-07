import { ShoppingCartOutlined } from '@ant-design/icons';
import {
  Avatar,
  Button,
  Col,
  Divider,
  Form,
  Input,
  InputNumber,
  List,
  Rate,
  Row,
  Space,
  Tag,
  Typography,
  message,
} from 'antd';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useParams } from 'react-router-dom';
import { productApi } from '../api/services.js';
import LoadingState from '../components/LoadingState.jsx';
import { addToCart } from '../features/cart/cartSlice.js';
import { formatCurrency, formatDate } from '../utils/format.js';
import { fallbackImage, getImageUrl } from '../utils/image.js';

const { Paragraph, Text, Title } = Typography;

export default function ProductDetailPage() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [reviewing, setReviewing] = useState(false);
  const [form] = Form.useForm();

  const loadProduct = async () => {
    setLoading(true);
    try {
      const data = await productApi.get(id);
      setProduct(data.product);
    } catch (error) {
      message.error(error.response?.data?.message || 'Could not load product');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProduct();
  }, [id]);

  const addItem = () => {
    dispatch(addToCart({ product, quantity }));
    message.success(`${product.name} added to cart`);
  };

  const submitReview = async (values) => {
    setReviewing(true);
    try {
      const data = await productApi.review(product._id, values);
      setProduct(data.product);
      form.resetFields();
      message.success('Review added');
    } catch (error) {
      message.error(error.response?.data?.message || 'Could not add review');
    } finally {
      setReviewing(false);
    }
  };

  if (loading) {
    return <LoadingState label="Loading product" />;
  }

  if (!product) {
    return (
      <section className="page-section">
        <Title level={2}>Product not found</Title>
      </section>
    );
  }

  return (
    <section className="page-section">
      <Row gutter={[32, 32]}>
        <Col xs={24} md={11}>
          <img
            className="product-detail-image"
            src={getImageUrl(product.image?.url)}
            alt={product.name}
            onError={(event) => {
              event.currentTarget.src = fallbackImage;
            }}
          />
        </Col>
        <Col xs={24} md={13}>
          <Space direction="vertical" size={16} className="full-width">
            <Tag color="green">{product.category?.name}</Tag>
            <Title>{product.name}</Title>
            <Space>
              <Rate disabled allowHalf value={product.ratingAverage || 0} />
              <Text type="secondary">({product.ratingCount || 0} reviews)</Text>
            </Space>
            <Title level={2}>{formatCurrency(product.price)}</Title>
            <Paragraph>{product.description}</Paragraph>
            <Space wrap>
              <Tag>{product.unit}</Tag>
              <Tag color={product.stock ? 'blue' : 'red'}>
                {product.stock ? `${product.stock} in stock` : 'Out of stock'}
              </Tag>
            </Space>
            <Space wrap>
              <InputNumber
                min={1}
                max={Math.max(product.stock, 1)}
                value={quantity}
                onChange={(value) => setQuantity(value || 1)}
                disabled={!product.stock}
              />
              <Button
                type="primary"
                icon={<ShoppingCartOutlined />}
                onClick={addItem}
                disabled={!product.stock}
              >
                Add to cart
              </Button>
            </Space>
          </Space>
        </Col>
      </Row>

      <Divider />

      <Row gutter={[32, 32]}>
        <Col xs={24} md={12}>
          <Title level={3}>Reviews</Title>
          <List
            dataSource={product.reviews || []}
            locale={{ emptyText: 'No reviews yet' }}
            renderItem={(review) => (
              <List.Item>
                <List.Item.Meta
                  avatar={<Avatar>{review.name?.[0]}</Avatar>}
                  title={
                    <Space wrap>
                      <Text strong>{review.name}</Text>
                      <Rate disabled value={review.rating} />
                    </Space>
                  }
                  description={
                    <>
                      <Paragraph>{review.comment}</Paragraph>
                      <Text type="secondary">{formatDate(review.createdAt)}</Text>
                    </>
                  }
                />
              </List.Item>
            )}
          />
        </Col>
        <Col xs={24} md={12}>
          <Title level={3}>Add a review</Title>
          {user ? (
            <Form form={form} layout="vertical" onFinish={submitReview}>
              <Form.Item
                name="rating"
                label="Rating"
                rules={[{ required: true, message: 'Rating is required' }]}
              >
                <Rate />
              </Form.Item>
              <Form.Item
                name="comment"
                label="Comment"
                rules={[{ required: true, message: 'Comment is required' }]}
              >
                <Input.TextArea rows={4} />
              </Form.Item>
              <Button type="primary" htmlType="submit" loading={reviewing}>
                Submit review
              </Button>
            </Form>
          ) : (
            <Text>
              <Link to="/login">Login</Link> to review this product.
            </Text>
          )}
        </Col>
      </Row>
    </section>
  );
}
