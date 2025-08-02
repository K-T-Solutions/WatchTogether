# FROM openjdk:21-jdk-alpine

# WORKDIR /app

# # Copy Maven wrapper and pom.xml
# COPY mvnw .
# COPY mvnw.cmd .
# COPY pom.xml .

# # Make mvnw executable
# RUN chmod +x mvnw

# # Download dependencies
# RUN ./mvnw dependency:go-offline -B

# # Copy source code
# COPY src ./src

# # Build the application
# RUN ./mvnw clean package -DskipTests

# # Create a new stage for runtime
# FROM openjdk:21-jre-alpine

# WORKDIR /app

# # Install curl for health checks
# RUN apk add --no-cache curl

# # Copy the built jar from the build stage
# COPY --from=0 /app/target/*.jar app.jar

# # Expose port
# EXPOSE 8080

# # Health check
# HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
#   CMD curl -f http://localhost:8080/actuator/health || exit 1

# # Run the application
# ENTRYPOINT ["java", "-jar", "app.jar"] 