import AppRouter from "./router/AppRouter";

import NavigationLoader from "@/components/ui/NavigationLoader/NavigationLoader";

const App = () => {
  return (
    <>
      <AppRouter />
      <NavigationLoader />
    </>
  );
};

export default App;