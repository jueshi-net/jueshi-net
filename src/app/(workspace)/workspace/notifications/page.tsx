import { Metadata } from "next";
import NotificationsClient from "./notifications-client";

export const metadata: Metadata = {
  title: "通知中心 — 海外百宝箱",
  description: "查看系统通知、任务提醒、等级升级等消息",
};

export default function NotificationsPage() {
  return <NotificationsClient />;
}
