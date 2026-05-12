import { DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons';
import {
  Button,
  Form,
  Image,
  Input,
  InputNumber,
  Modal,
  Popconfirm,
  Select,
  Space,
  Switch,
  Table,
  Typography,
  Upload,
  message,
} from 'antd';
import { useEffect, useState } from 'react';
import { categoryApi, productApi } from '../../api/services.js';
import { formatCurrency } from '../../utils/format.js';
import { fallbackImage, getImageUrl } from '../../utils/image.js';

const { Title } = Typography;

export default function AdminProductsPage() {
  const [form] = Form.useForm();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const [productData, categoryData] = await Promise.all([
        productApi.list({ limit: 48 }),
        categoryApi.list(),
      ]);
      setProducts(productData.products);
      setCategories(categoryData.categories);
    } catch (error) {
      message.error(error.response?.data?.message || 'Could not load products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const openModal = (product = null) => {
    setEditing(product);
    form.resetFields();
    if (product) {
      const { image, ...productData } = product;
      form.setFieldsValue({
        ...productData,
        category: product.category?._id,
        imageUrl: product.image?.url?.startsWith('http') ? product.image.url : '',
        tags: product.tags?.join(', '),
        image: [],
      });
    }
    setModalOpen(true);
  };

  const submit = async (values) => {
    setSaving(true);
    try {
      const formData = new FormData();
      Object.entries(values).forEach(([key, value]) => {
        if (key === 'image' || value === undefined || value === null) return;
        formData.append(key, value);
      });
      const file = values.image?.[0]?.originFileObj;
      if (file) formData.append('image', file);

      if (editing) {
        await productApi.update(editing._id, formData);
        message.success('Product updated');
      } else {
        await productApi.create(formData);
        message.success('Product created');
      }

      setModalOpen(false);
      await load();
    } catch (error) {
      message.error(error.response?.data?.message || 'Could not save product');
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id) => {
    try {
      await productApi.remove(id);
      message.success('Product deleted');
      await load();
    } catch (error) {
      message.error(error.response?.data?.message || 'Could not delete product');
    }
  };

  return (
    <Space direction="vertical" size={20} className="full-width">
      <div className="admin-page-title">
        <Title level={1}>Products</Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => openModal()}>
          Add product
        </Button>
      </div>
      <Table
        rowKey="_id"
        loading={loading}
        dataSource={products}
        scroll={{ x: 980 }}
        columns={[
          {
            title: 'Image',
            dataIndex: ['image', 'url'],
            render: (url, product) => (
              <Image
                width={56}
                height={56}
                src={getImageUrl(url)}
                fallback={fallbackImage}
                alt={product.name}
              />
            ),
          },
          { title: 'Name', dataIndex: 'name' },
          { title: 'Category', dataIndex: ['category', 'name'] },
          { title: 'Price', dataIndex: 'price', render: formatCurrency },
          { title: 'Stock', dataIndex: 'stock' },
          {
            title: 'Featured',
            dataIndex: 'featured',
            render: (featured) => (featured ? 'Yes' : 'No'),
          },
          {
            title: 'Actions',
            render: (_, product) => (
              <Space>
                <Button icon={<EditOutlined />} onClick={() => openModal(product)} />
                <Popconfirm title="Delete product?" onConfirm={() => remove(product._id)}>
                  <Button danger icon={<DeleteOutlined />} />
                </Popconfirm>
              </Space>
            ),
          },
        ]}
      />

      <Modal
        open={modalOpen}
        title={editing ? 'Edit product' : 'Add product'}
        onCancel={() => setModalOpen(false)}
        onOk={() => form.submit()}
        confirmLoading={saving}
        width={760}
      >
        <Form form={form} layout="vertical" onFinish={submit} initialValues={{ featured: false, unit: '100g' }}>
          <Form.Item name="name" label="Name" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="description" label="Description" rules={[{ required: true }]}>
            <Input.TextArea rows={4} />
          </Form.Item>
          <Space className="admin-form-row" align="start">
            <Form.Item name="price" label="Price" rules={[{ required: true }]} className="flex-1">
              <InputNumber min={0} className="full-width" />
            </Form.Item>
            <Form.Item name="stock" label="Stock" rules={[{ required: true }]} className="flex-1">
              <InputNumber min={0} className="full-width" />
            </Form.Item>
            <Form.Item name="unit" label="Unit" className="flex-1">
              <Input />
            </Form.Item>
          </Space>
          <Form.Item name="category" label="Category" rules={[{ required: true }]}>
            <Select
              options={categories.map((category) => ({
                label: category.name,
                value: category._id,
              }))}
            />
          </Form.Item>
          <Form.Item name="tags" label="Tags">
            <Input placeholder="herbs, digestion, wellness" />
          </Form.Item>
          <Form.Item name="imageUrl" label="Image URL">
            <Input />
          </Form.Item>
          <Form.Item
            name="image"
            label="Upload image"
            valuePropName="fileList"
            getValueFromEvent={(event) => event?.fileList}
          >
            <Upload beforeUpload={() => false} maxCount={1} listType="picture">
              <Button>Choose image</Button>
            </Upload>
          </Form.Item>
          <Form.Item name="featured" label="Featured" valuePropName="checked">
            <Switch />
          </Form.Item>
        </Form>
      </Modal>
    </Space>
  );
}
