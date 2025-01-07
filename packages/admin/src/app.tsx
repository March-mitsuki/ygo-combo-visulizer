import { AppRouter } from "./app_router";
import store from "@admin/redux/store";
import { Provider as ReduxProvider } from "react-redux";
import { Provider as ChakraProvider } from "./components/ui/provider";
import { Toaster } from "./components/ui/toaster";

export default function App() {
  return (
    <ReduxProvider store={store}>
      <ChakraProvider>
        <Toaster />
        <AppRouter />
      </ChakraProvider>
    </ReduxProvider>
  );
}
