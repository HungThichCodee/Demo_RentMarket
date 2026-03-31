# Build stage
FROM maven:3.9.6-eclipse-temurin-21 AS build
WORKDIR /app
COPY pom.xml .
COPY src ./src
# Build ứng dụng
RUN mvn clean package -DskipTests

# Run stage
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
# Sao chép file jar đã build từ bước trên
COPY --from=build /app/target/*.jar app.jar

# Expose port (Dựa vào application.yaml: server.port=8080)
EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar"]
