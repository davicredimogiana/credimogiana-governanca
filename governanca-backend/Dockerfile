FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS base
WORKDIR /app
EXPOSE 5000
ENV ASPNETCORE_URLS=http://+:5000

FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

COPY ["Governanca.API/Governanca.API.csproj", "Governanca.API/"]
COPY ["Governanca.Application/Governanca.Application.csproj", "Governanca.Application/"]
COPY ["Governanca.Domain/Governanca.Domain.csproj", "Governanca.Domain/"]
COPY ["Governanca.Infrastructure/Governanca.Infrastructure.csproj", "Governanca.Infrastructure/"]

RUN dotnet restore "Governanca.API/Governanca.API.csproj"

COPY . .

RUN dotnet publish "Governanca.API/Governanca.API.csproj" -c Release -o /app/publish /p:UseAppHost=false

FROM base AS final
WORKDIR /app
COPY --from=build /app/publish .
ENTRYPOINT ["dotnet", "Governanca.API.dll"]
