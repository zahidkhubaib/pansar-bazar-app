import { Spin } from 'antd';

export default function LoadingState({ label = 'Loading' }) {
  return (
    <div className="loading-state">
      <Spin size="large" />
      <span>{label}</span>
    </div>
  );
}
