# 開発用イメージ（Next.js dev サーバー / ホットリロード）
FROM node:24-alpine

WORKDIR /app

# 依存だけ先にコピーしてレイヤーキャッシュを効かせる
COPY package.json package-lock.json* ./
RUN npm install

# ソースをコピー（開発時は compose のバインドマウントで上書きされる）
COPY . .

EXPOSE 3000

CMD ["npm", "run", "dev"]
