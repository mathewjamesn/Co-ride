import React from 'react';
import { StatusBar } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { SearchProvider } from './src/state';
import { Consent, Onboarding, Otp, Phone } from './src/screens/Auth';
import { Home } from './src/screens/Home';
import { Filter, Results, RouteDetail } from './src/screens/Results';
import { Menu, Status } from './src/screens/Misc';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <SafeAreaProvider>
      <SearchProvider>
        <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
        <NavigationContainer>
          <Stack.Navigator initialRouteName="Consent" screenOptions={{ headerShown: false }}>
            <Stack.Screen name="Consent" component={Consent} />
            <Stack.Screen name="Onboarding" component={Onboarding} />
            <Stack.Screen name="Phone" component={Phone} />
            <Stack.Screen name="Otp" component={Otp} />
            <Stack.Screen name="Home" component={Home} />
            <Stack.Screen name="Results" component={Results} />
            <Stack.Screen name="Route" component={RouteDetail} />
            <Stack.Screen name="Filter" component={Filter} options={{ presentation: 'modal' }} />
            <Stack.Screen name="Status" component={Status} />
            <Stack.Screen name="Menu" component={Menu} options={{ animation: 'slide_from_left' }} />
          </Stack.Navigator>
        </NavigationContainer>
      </SearchProvider>
    </SafeAreaProvider>
  );
}
