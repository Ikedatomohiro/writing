.PHONY: dev build start lint test deploy deploy-prod

# Development
dev:
	npm run dev -- --turbo

build:
	npm run build

start:
	npm run start

# Quality
lint:
	npm run lint

lint-fix:
	npm run lint:fix

format:
	npm run format

test:
	npm run test

test-coverage:
	npm run test:coverage

# Deploy
deploy:
	vercel

deploy-prod:
	vercel --prod
