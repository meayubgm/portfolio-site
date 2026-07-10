# Docker Compose v2 を使用。古い docker-compose を使う場合は
# `make up COMPOSE=docker-compose` のように上書きできる。
COMPOSE ?= docker compose

.DEFAULT_GOAL := help

.PHONY: help up down build rebuild logs ps sh restart install lint lint-fix test-e2e clean

help: ## コマンド一覧を表示
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-10s\033[0m %s\n", $$1, $$2}'

up: ## コンテナをバックグラウンド起動（docker compose up -d）
	$(COMPOSE) up -d

down: ## コンテナを停止・削除
	$(COMPOSE) down

build: ## イメージをビルド
	$(COMPOSE) build

rebuild: ## キャッシュ無しで再ビルドして起動
	$(COMPOSE) build --no-cache
	$(COMPOSE) up -d

logs: ## ログを追跡表示
	$(COMPOSE) logs -f

ps: ## 起動中のコンテナを表示
	$(COMPOSE) ps

sh: ## app コンテナのシェルに入る
	$(COMPOSE) exec app sh

restart: ## コンテナを再起動
	$(COMPOSE) restart

install: ## コンテナ内で依存をインストール
	$(COMPOSE) exec app npm install

lint: ## Biome + ESLint(Next) で lint/format をチェック（書き込みなし）
	$(COMPOSE) exec app npm run lint

lint-fix: ## Biome + ESLint で lint/format を自動修正
	$(COMPOSE) exec app npm run lint:fix

test-e2e: ## Playwright E2E を実行（ホストで実行。事前に make up が必要）
	npx playwright test

clean: ## コンテナとボリュームを削除
	$(COMPOSE) down -v
