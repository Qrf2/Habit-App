import React, { useEffect, useState } from "react";
import * as SplashScreen from "expo-splash-screen";
import Splash from "../components/Splash";
import Navigators from "../components/navigations/Navigators";
import { Provider } from "react-redux";
import store from "../components/store";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaView } from "react-native-safe-area-context";
import { ProfileProvider } from "../context/ProfileContext";

export default function App() {
  const [appIsReady, setAppIsReady] = useState(false);

  useEffect(() => {
    async function prepare() {
      try {
        await SplashScreen.preventAutoHideAsync();
        await new Promise((resolve) => setTimeout(resolve, 1000));
      } catch (e) {
        console.warn(e);
      } finally {
        setAppIsReady(true);
      }
    }

    prepare();
  }, []);

  useEffect(() => {
    if (appIsReady) {
      SplashScreen.hideAsync();
    }
  }, [appIsReady]);

  if (!appIsReady) {
    return <Splash />;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Provider store={store}>
        <ProfileProvider>
          <SafeAreaView style={{ flex: 1, backgroundColor: "white" }}>
            <Navigators />
          </SafeAreaView>
        </ProfileProvider>
      </Provider>
    </GestureHandlerRootView>
  );
}
