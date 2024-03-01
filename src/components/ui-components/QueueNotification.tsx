import { notification } from "antd";
import { NotificationStatus } from "@/src/types";

interface Props {
  header: string;
  message?: string;
  durationInSeconds?: number;
  status: NotificationStatus;
}

const queueNotification = ({
  header,
  message,
  durationInSeconds = 4.5,
  status,
}: Props) => {
  const args = {
    message: header,
    key: message,
    description: message,
    duration: durationInSeconds,
  };

  // queues notifcation
  notification[status](args);
};

export default queueNotification;
