import { DeleteOutlined } from '@ant-design/icons';
import { Button, Popconfirm, Select, Space, Table, Tag, Typography, message } from 'antd';
import { useEffect, useState } from 'react';
import { userApi } from '../../api/services.js';
import { formatDate } from '../../utils/format.js';

const { Title } = Typography;

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const data = await userApi.list();
      setUsers(data.users);
    } catch (error) {
      message.error(error.response?.data?.message || 'Could not load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const updateRole = async (user, role) => {
    try {
      await userApi.update(user._id, { role });
      message.success('User updated');
      await load();
    } catch (error) {
      message.error(error.response?.data?.message || 'Could not update user');
    }
  };

  const remove = async (id) => {
    try {
      await userApi.remove(id);
      message.success('User deleted');
      await load();
    } catch (error) {
      message.error(error.response?.data?.message || 'Could not delete user');
    }
  };

  return (
    <Space direction="vertical" size={20} className="full-width">
      <Title level={1}>Users</Title>
      <Table
        rowKey="_id"
        loading={loading}
        dataSource={users}
        scroll={{ x: 820 }}
        columns={[
          { title: 'Name', dataIndex: 'name' },
          { title: 'Email', dataIndex: 'email' },
          { title: 'Phone', dataIndex: 'phone' },
          { title: 'Joined', dataIndex: 'createdAt', render: formatDate },
          {
            title: 'Role',
            dataIndex: 'role',
            render: (role, user) => (
              <Select
                value={role}
                onChange={(value) => updateRole(user, value)}
                options={[
                  { value: 'user', label: 'User' },
                  { value: 'admin', label: 'Admin' },
                ]}
              />
            ),
          },
          {
            title: 'Status',
            dataIndex: 'role',
            render: (role) => <Tag color={role === 'admin' ? 'green' : 'blue'}>{role}</Tag>,
          },
          {
            title: '',
            render: (_, user) => (
              <Popconfirm title="Delete user?" onConfirm={() => remove(user._id)}>
                <Button danger icon={<DeleteOutlined />} />
              </Popconfirm>
            ),
          },
        ]}
      />
    </Space>
  );
}
