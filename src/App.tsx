import AppRouter from "./router/AppRouter";

import NavigationLoader from "@/components/ui/NavigationLoader/NavigationLoader";

import { AuthProvider } from "@/auth/AuthContext";

const App = () => {
  return (
    <AuthProvider>
      <AppRouter />
      <NavigationLoader />
    </AuthProvider>
  );
};

export default App;