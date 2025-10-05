# ----------- Builder Stage -----------
FROM node:20.10.0 AS builder

WORKDIR /app

# Copier tous les fichiers nécessaires au projet Angular
COPY . .

# Installer les dépendances et construire l'app
RUN npm install
RUN npm run build

# ----------- Runtime Stage -----------
FROM debian:bullseye-slim

LABEL fly_launch_runtime="nodejs"

COPY --from=builder /usr/local/ /usr/local/
COPY --from=builder /app /app

WORKDIR /app
ENV NODE_ENV=production
ENV PATH=/usr/local/bin:$PATH

CMD ["npm", "run", "start"]
