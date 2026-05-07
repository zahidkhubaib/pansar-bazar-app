import { FilterOutlined, SearchOutlined } from '@ant-design/icons';
import {
  Button,
  Col,
  Drawer,
  Empty,
  Form,
  Input,
  Pagination,
  Row,
  Select,
  Slider,
  Space,
  Typography,
  message,
} from 'antd';
import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { categoryApi, productApi } from '../api/services.js';
import LoadingState from '../components/LoadingState.jsx';
import ProductCard from '../components/ProductCard.jsx';

const { Title } = Typography;

export default function ProductsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [form] = Form.useForm();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0, limit: 12 });
  const [loading, setLoading] = useState(true);
  const [filterOpen, setFilterOpen] = useState(false);

  const params = useMemo(
    () => ({
      search: searchParams.get('search') || '',
      category: searchParams.get('category') || undefined,
      minPrice: searchParams.get('minPrice') || undefined,
      maxPrice: searchParams.get('maxPrice') || undefined,
      sort: searchParams.get('sort') || 'newest',
      page: Number(searchParams.get('page') || 1),
      limit: 12,
    }),
    [searchParams],
  );

  useEffect(() => {
    form.setFieldsValue({
      search: params.search,
      category: params.category,
      price: [Number(params.minPrice || 0), Number(params.maxPrice || 5000)],
      sort: params.sort,
    });
  }, [form, params]);

  useEffect(() => {
    const loadProducts = async () => {
      setLoading(true);
      try {
        const [productData, categoryData] = await Promise.all([
          productApi.list(params),
          categoryApi.list(),
        ]);
        setProducts(productData.products);
        setPagination(productData.pagination);
        setCategories(categoryData.categories.filter((category) => category.isActive));
      } catch (error) {
        message.error(error.response?.data?.message || 'Could not load products');
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, [params]);

  const applyFilters = (values) => {
    const next = new URLSearchParams();

    if (values.search) next.set('search', values.search.trim());
    if (values.category) next.set('category', values.category);
    if (values.price?.[0]) next.set('minPrice', values.price[0]);
    if (values.price?.[1] && values.price[1] < 5000) next.set('maxPrice', values.price[1]);
    if (values.sort && values.sort !== 'newest') next.set('sort', values.sort);
    next.set('page', '1');

    setSearchParams(next);
    setFilterOpen(false);
  };

  const filters = (
    <Form form={form} layout="vertical" onFinish={applyFilters} className="filters-form">
      <Form.Item name="search" label="Search">
        <Input prefix={<SearchOutlined />} placeholder="Ajwain, honey, kalonji" allowClear />
      </Form.Item>
      <Form.Item name="category" label="Category">
        <Select
          allowClear
          placeholder="All categories"
          options={categories.map((category) => ({
            label: category.name,
            value: category.slug,
          }))}
        />
      </Form.Item>
      <Form.Item name="price" label="Price range">
        <Slider range min={0} max={5000} step={50} />
      </Form.Item>
      <Form.Item name="sort" label="Sort by">
        <Select
          options={[
            { value: 'newest', label: 'Newest' },
            { value: 'price_asc', label: 'Price: low to high' },
            { value: 'price_desc', label: 'Price: high to low' },
            { value: 'rating', label: 'Top rated' },
          ]}
        />
      </Form.Item>
      <Space className="full-width">
        <Button type="primary" htmlType="submit">
          Apply
        </Button>
        <Button
          onClick={() => {
            form.resetFields();
            setSearchParams({});
          }}
        >
          Reset
        </Button>
      </Space>
    </Form>
  );

  return (
    <section className="page-section catalog-section">
      <div className="section-heading">
        <div>
          <Title level={1}>Products</Title>
          <p>{pagination.total} items available</p>
        </div>
        <Button icon={<FilterOutlined />} onClick={() => setFilterOpen(true)} className="mobile-only">
          Filters
        </Button>
      </div>

      <Row gutter={[24, 24]}>
        <Col xs={0} md={7} lg={6}>
          <aside className="filter-panel">{filters}</aside>
        </Col>
        <Col xs={24} md={17} lg={18}>
          {loading ? (
            <LoadingState label="Loading products" />
          ) : products.length ? (
            <>
              <Row gutter={[20, 20]}>
                {products.map((product) => (
                  <Col key={product._id} xs={24} sm={12} lg={8} xl={6}>
                    <ProductCard product={product} />
                  </Col>
                ))}
              </Row>
              <Pagination
                className="catalog-pagination"
                current={pagination.page}
                pageSize={pagination.limit}
                total={pagination.total}
                onChange={(page) => {
                  const next = new URLSearchParams(searchParams);
                  next.set('page', page);
                  setSearchParams(next);
                }}
              />
            </>
          ) : (
            <Empty description="No products match the filters" />
          )}
        </Col>
      </Row>

      <Drawer open={filterOpen} onClose={() => setFilterOpen(false)} title="Filters">
        {filters}
      </Drawer>
    </section>
  );
}
