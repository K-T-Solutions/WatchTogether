FROM maven:3.9.9-eclipse-temurin-21 AS builder

WORKDIR /app

COPY pom.xml .

RUN mvn dependency:go-offline -B

COPY src ./src

RUN mvn clean package -DskipTests

FROM openjdk:21-jdk AS runner

WORKDIR /app

COPY --from=builder /app/target/auth-service-0.0.1-SNAPSHOT.jar ./app.jar

# Экспортируем оба порта: 4002 для HTTP и 9090 для gRPC
EXPOSE 4002 9090

ENTRYPOINT ["java", "-jar", "app.jar"]