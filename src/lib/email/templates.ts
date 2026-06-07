/**
 * Email HTML Templates for JueShi.net Newsletter
 * Apple-minimalist design, mobile-responsive, dark-mode compatible.
 */

export function generateNewsletterWelcomeEmail(email: string): {
  subject: string;
  html: string;
  text: string;
} {
  const subject = "🚀 欢迎订阅出海锦囊 — 海外百宝箱";

  const html = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>欢迎订阅出海锦囊</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background: #f5f5f7; color: #1d1d1f; line-height: 1.6; }
    .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; margin-top: 40px; box-shadow: 0 2px 12px rgba(0,0,0,0.06); }
    .header { background: linear-gradient(135deg, #0d9488 0%, #3b82f6 100%); padding: 32px 24px; text-align: center; }
    .header h1 { color: #ffffff; font-size: 22px; font-weight: 600; letter-spacing: -0.5px; }
    .header p { color: rgba(255,255,255,0.85); font-size: 13px; margin-top: 4px; }
    .body { padding: 36px 28px; }
    .body h2 { font-size: 18px; font-weight: 600; color: #1d1d1f; margin-bottom: 16px; }
    .body p { font-size: 15px; color: #6e6e73; margin-bottom: 12px; }
    .highlight { background: #f0fdfa; border-left: 3px solid #0d9488; padding: 16px 20px; border-radius: 0 8px 8px 0; margin: 20px 0; }
    .highlight p { color: #0f766e; font-weight: 500; margin: 0; }
    .btn { display: inline-block; background: #0d9488; color: #ffffff; text-decoration: none; padding: 12px 28px; border-radius: 10px; font-size: 15px; font-weight: 500; margin-top: 20px; }
    .btn:hover { background: #0f766e; }
    .footer { background: #fafafa; padding: 24px 28px; text-align: center; border-top: 1px solid #e5e5e5; }
    .footer p { font-size: 12px; color: #86868b; margin-bottom: 4px; }
    .footer a { color: #86868b; text-decoration: underline; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>海外百宝箱 | JueShi.net</h1>
      <p>为出海人群打造的瑞士军刀</p>
    </div>
    <div class="body">
      <h2>🎉 欢迎登船！</h2>
      <p>感谢您订阅<strong>出海锦囊</strong>。</p>
      <p>我们将每周为您甄选：</p>
      <div class="highlight">
        <p>🌐 全球最新跨境极客工具</p>
        <p>📦 HS 海关编码规避指南</p>
        <p>✈️ 留学生本地化生存红利</p>
        <p>💼 数字游民远程工作秘籍</p>
      </div>
      <p>无论您是跨境商户、留学生还是数字游民，这里都有为您定制的出海解法。</p>
      <a href="https://jueshi.net" class="btn">浏览全部工具 →</a>
    </div>
    <div class="footer">
      <p>© ${new Date().getFullYear()} 海外百宝箱 jueshi.net</p>
      <p>此邮件由系统自动发送，请勿直接回复。</p>
      <p><a href="https://jueshi.net/api/newsletter/unsubscribe?email=${encodeURIComponent(email)}">取消订阅</a></p>
    </div>
  </div>
</body>
</html>`;

  const text = `欢迎订阅出海锦囊 — 海外百宝箱 (JueShi.net)

感谢您订阅出海锦囊。

我们将每周为您甄选：
• 全球最新跨境极客工具
• HS 海关编码规避指南
• 留学生本地化生存红利
• 数字游民远程工作秘籍

浏览全部工具：https://jueshi.net

---
© ${new Date().getFullYear()} 海外百宝箱 jueshi.net
取消订阅：https://jueshi.net/api/newsletter/unsubscribe?email=${encodeURIComponent(email)}`;

  return { subject, html, text };
}
