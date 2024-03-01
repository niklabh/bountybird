import React from 'react';
import { Popover } from 'antd';

interface WelcomePopoverProps {
  onVisibleChange: (visible: boolean) => void;
}

const WelcomePopover: React.FC<WelcomePopoverProps> = ({ onVisibleChange }) => {
  return (
    <Popover
      title="Hello Welcome"
      content="Thank you for visiting our homepage! This is a welcome message."
      onVisibleChange={onVisibleChange}
    >
      <div>Content of the popover trigger</div>
    </Popover>
  );
};

export default WelcomePopover;
