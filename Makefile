DOCKER_IMG=kkleidal/german-collage
CONTAINER_NAME="german-collage-container"

CID := $(shell cat run 2>/dev/null)

ifndef $(HOST)
		HOST := 0.0.0.0
	endif

ifndef $(PORT)
		PORT := 80
	endif

EXISTING := $(shell docker ps -aq -f "name=$(CONTAINER_NAME)")

build:
		docker build -t $(DOCKER_IMG) .

run: build stop rm
		docker run -d -p '$(HOST):$(PORT):80' --volume '$(shell pwd)/app:/app' --name $(CONTAINER_NAME) "$(DOCKER_IMG)"

stop:
		@if [ -n "$(EXISTING)" ]; then\
					docker stop $(EXISTING);\
						fi

rm:
		@if [ -n "$(EXISTING)" ]; then\
					docker rm $(EXISTING);\
						fi

clean: stop rm

all: build
