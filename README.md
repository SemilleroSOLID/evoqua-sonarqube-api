# evoqua-sonarqube-api

Permite el uso de SonarQube como analizador estático de código dentro de
_evoqua_, un visualizador de la evolución de la calidad de diseño de un
software basado en tubos de kiviat.

Implementa la API del analizador definida en `@evoqua/types`, actuando como
adaptador que, para obtener los datos, realiza peticiones a la web API de
SonarQube y transforma las respuestas en modelos que los componentes del
visualizador esperan recibir.

## Ejemplo de uso
```jsx
const { SONAR_URL, SONAR_USERNAME, SONAR_PASSWORD } = process.env;

function App() {
  const api = new SonarQubeApi(SONAR_URL!);
  const [loggedIn, setLoggedIn] = React.useState(false);
  React.useEffect(() => {
    api.login(SONAR_USERNAME!, SONAR_PASSWORD!)
       .then(() => setLoggedIn(true));
  });
  return loggedIn
    ? <Dashboard
        projectsGetter={api}
        metricHistoryGetter={api}
        versionMetricsGetter={api}
      />
    : <p>Iniciando sesión...</p>;
}
```
