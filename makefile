all: pre_requisite

pre_requisite:
	@echo "Package Installation......."
	cd server && npm install
	cd client && npm install

start_server:
	cd server && npm run start

start_client:
	cd client && npm run start

local_build:
	cd client && npm run dev-build
	cd server && npm run start
	@echo "Visit http://localhost:10010"

deploy:
	sudo docker-compose up -d --build 

