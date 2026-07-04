path = '/home/deploy/xixiong-saas/scripts/contentops/contentops-telegram-bot.ts'
with open(path, 'r') as f:
    content = f.read()

# Replace the slug generation regex
content = content.replace(
    r".replace(/[^\w\s-]/g, '')",
    r".replace(/[^\u4e00-\u9fa5\w\s-]/g, '')"
)

with open(path, 'w') as f:
    f.write(content)

print('Slug generation fixed')
