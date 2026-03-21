FROM eclipse-temurin:23-jdk AS build
WORKDIR /app
COPY gradle gradle
COPY gradlew .
COPY build.gradle .
COPY settings.gradle .
COPY src src
RUN ./gradlew build -x test

FROM eclipse-temurin:23-jre
WORKDIR /app
COPY --from=build /app/build/libs/penny-wise-v1-0.0.1-SNAPSHOT.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
