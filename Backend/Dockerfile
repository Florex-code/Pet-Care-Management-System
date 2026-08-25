FROM maven:3.9-eclipse-temurin-21 AS build
WORKDIR /app

COPY pom.xml ./
RUN mvn -B dependency:go-offline

COPY src ./src
RUN mvn -B clean package -DskipTests

FROM eclipse-temurin:21-jre
WORKDIR /app

RUN useradd --system --create-home pawcare
COPY --from=build --chown=pawcare:pawcare /app/target/*.jar app.jar

USER pawcare
EXPOSE 10000
ENTRYPOINT ["java", "-jar", "/app/app.jar"]
