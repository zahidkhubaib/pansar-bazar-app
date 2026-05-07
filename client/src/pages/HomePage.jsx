import { ArrowRightOutlined, ShoppingOutlined } from '@ant-design/icons';
import { Button, Col, Empty, Row, Space, Tag, Typography, message } from 'antd';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { categoryApi, productApi } from '../api/services.js';
import LoadingState from '../components/LoadingState.jsx';
import ProductCard from '../components/ProductCard.jsx';

const { Paragraph, Title } = Typography;

export default function HomePage() {
  const [featured, setFeatured] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadHome = async () => {
      try {
        const [productData, categoryData] = await Promise.all([
          productApi.list({ featured: true, limit: 8 }),
          categoryApi.list(),
        ]);
        setFeatured(productData.products);
        setCategories(categoryData.categories.filter((category) => category.isActive));
      } catch (error) {
        message.error(error.response?.data?.message || 'Could not load store');
      } finally {
        setLoading(false);
      }
    };

    loadHome();
  }, []);

  return (
    <>
      <section className="hero-section">
        <div className="hero-content">
          <Tag color="green">Fresh stock daily</Tag>
          <Title>Pansar Bazar</Title>
          <Paragraph>
            Herbal remedies, spices, oils, seeds, dry fruits, and traditional pansari products
            delivered with care.
          </Paragraph>
          <Space wrap>
            <Link to="/products">
              <Button type="primary" size="large" icon={<ShoppingOutlined />}>
                Shop products
              </Button>
            </Link>
            <Link to="/products?category=herbs">
              <Button size="large" icon={<ArrowRightOutlined />}>
                Browse herbs
              </Button>
            </Link>
          </Space>
        </div>
      </section>

      <section className="page-section">
        <div className="section-heading">
          <div>
            <Title level={2}>Popular categories</Title>
            <Paragraph>Stocked for home remedies, kitchens, and wellness routines.</Paragraph>
          </div>
          <Link to="/products">
            <Button>View all</Button>
          </Link>
        </div>
        <div className="category-strip">
          {categories.map((category) => (
            <Link key={category._id} to={`/products?category=${category.slug}`}>
              <span>{category.name}</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="page-section">
        <div className="section-heading">
          <div>
            <Title level={2}>Featured products</Title>
            <Paragraph>Trusted pansari essentials selected for quality and freshness.</Paragraph>
          </div>
        </div>

        {loading ? (
          <LoadingState label="Loading featured products" />
        ) : featured.length ? (
          <Row gutter={[20, 20]}>
            {featured.map((product) => (
              <Col key={product._id} xs={24} sm={12} md={8} lg={6}>
                <ProductCard product={product} />
              </Col>
            ))}
          </Row>
        ) : (
          <Empty description="No featured products yet" />
        )}
      </section>
    </>
  );
}
