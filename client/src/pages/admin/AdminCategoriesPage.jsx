import { DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons';
import {
  Button,
  Form,
  Input,
  Modal,
  Popconfirm,
  Space,
  Switch,
  Table,
  Typography,
  message,
} from 'antd';
import { useEffect, useState } from 'react';
import { categoryApi } from '../../api/services.js';

const { Title } = Typography;

export default function AdminCategoriesPage() {
  const [form] = Form.useForm();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const data = await categoryApi.list();
      setCategories(data.categories);
    } catch (error) {
      message.error(error.response?.data?.message || 'Could not load categories');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const openModal = (category = null) => {
    setEditing(category);
    form.resetFields();
    form.setFieldsValue(category || { isActive: true });
    setModalOpen(true);
  };

  const submit = async (values) => {
    setSaving(true);
    try {
      if (editing) {
        await categoryApi.update(editing._id, values);
        message.success('Category updated');
      } else {
        await categoryApi.create(values);
        message.success('Category created');
      }
      setModalOpen(false);
      await load();
    } catch (error) {
      message.error(error.response?.data?.message || 'Could not save category');
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id) => {
    try {
      await categoryApi.remove(id);
      message.success('Category deleted');
      await load();
    } catch (error) {
      message.error(error.response?.data?.message || 'Could not delete category');
    }
  };

  return (
    <Space direction="vertical" size={20} className="full-width">
      <div className="admin-page-title">
        <Title level={1}>Categories</Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => openModal()}>
          Add category
        </Button>
      </div>
      <Table
        rowKey="_id"
        loading={loading}
        dataSource={categories}
        columns={[
          { title: 'Name', dataIndex: 'name' },
          { title: 'Slug', dataIndex: 'slug' },
          { title: 'Active', dataIndex: 'isActive', render: (active) => (active ? 'Yes' : 'No') },
          {
            title: 'Actions',
            render: (_, category) => (
              <Space>
                <Button icon={<EditOutlined />} onClick={() => openModal(category)} />
                <Popconfirm title="Delete category?" onConfirm={() => remove(category._id)}>
                  <Button danger icon={<DeleteOutlined />} />
                </Popconfirm>
              </Space>
            ),
          },
        ]}
      />
      <Modal
        open={modalOpen}
        title={editing ? 'Edit category' : 'Add category'}
        onCancel={() => setModalOpen(false)}
        onOk={() => form.submit()}
        confirmLoading={saving}
      >
        <Form form={form} layout="vertical" onFinish={submit}>
          <Form.Item name="name" label="Name" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="description" label="Description">
            <Input.TextArea rows={3} />
          </Form.Item>
          <Form.Item name="isActive" label="Active" valuePropName="checked">
            <Switch />
          </Form.Item>
        </Form>
      </Modal>
    </Space>
  );
}
