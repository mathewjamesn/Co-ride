import React from 'react';
import { StatusBar } from 'react-native';
import { DarkTheme, DefaultTheme, NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { SearchProvider } from './src/state';
import { TripProvider } from './src/trip';
import { GarageProvider } from './src/garage';
import { ChatProvider } from './src/chat';
import { ThemeProvider, themed, useTheme } from './src/themeContext';
import { colors } from './src/theme';
import { AddVehicle, Vehicles } from './src/screens/Vehicles';
import { Chat } from './src/screens/Chat';
import { CancelRide, History, Settings, Wallet } from './src/screens/More';
import { Onboarding, Otp, Phone } from './src/screens/Auth';
import { Home } from './src/screens/Home';
import { Drop } from './src/screens/Drop';
import { Plan } from './src/screens/Plan';
import { Filter, Matches, Results, RouteDetail } from './src/screens/Results';
import { Menu, Status } from './src/screens/Misc';
import { Accepted, DriverTrip, RideComplete, RiderTrip } from './src/screens/Trip';

const Stack = createNativeStackNavigator();

// Every screen is wrapped so it re-renders (and rebuilds its styles) when the theme changes.
const Screens = {
  Onboarding: themed(Onboarding),
  Phone: themed(Phone),
  Otp: themed(Otp),
  Home: themed(Home),
  Drop: themed(Drop),
  Plan: themed(Plan),
  Matches: themed(Matches),
  Results: themed(Results),
  Route: themed(RouteDetail),
  Filter: themed(Filter),
  Status: themed(Status),
  Accepted: themed(Accepted),
  RiderTrip: themed(RiderTrip),
  DriverTrip: themed(DriverTrip),
  RideComplete: themed(RideComplete),
  Chat: themed(Chat),
  CancelRide: themed(CancelRide),
  Vehicles: themed(Vehicles),
  AddVehicle: themed(AddVehicle),
  Settings: themed(Settings),
  History: themed(History),
  Wallet: themed(Wallet),
  Menu: themed(Menu),
};

function Shell() {
  const { mode } = useTheme();
  const base = mode === 'dark' ? DarkTheme : DefaultTheme;
  const navTheme = { ...base, colors: { ...base.colors, background: colors.ground, card: colors.ground, text: colors.text, border: colors.line } };
  const locked = { gestureEnabled: false } as const;
  return (
    <>
      <StatusBar barStyle={mode === 'dark' ? 'light-content' : 'dark-content'} backgroundColor={colors.ground} />
      <NavigationContainer theme={navTheme}>
        <Stack.Navigator initialRouteName="Onboarding" screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.ground } }}>
          {/* First launch: Carpool intro, then phone number and OTP */}
          <Stack.Screen name="Onboarding" component={Screens.Onboarding} />
          <Stack.Screen name="Phone" component={Screens.Phone} />
          <Stack.Screen name="Otp" component={Screens.Otp} />
          <Stack.Screen name="Home" component={Screens.Home} />
          <Stack.Screen name="Drop" component={Screens.Drop} />
          <Stack.Screen name="Plan" component={Screens.Plan} />
          <Stack.Screen name="Matches" component={Screens.Matches} />
          <Stack.Screen name="Results" component={Screens.Results} />
          <Stack.Screen name="Route" component={Screens.Route} />
          <Stack.Screen name="Filter" component={Screens.Filter} options={{ presentation: 'modal' }} />
          <Stack.Screen name="Status" component={Screens.Status} />
          <Stack.Screen name="Accepted" component={Screens.Accepted} options={locked} />
          <Stack.Screen name="RiderTrip" component={Screens.RiderTrip} options={locked} />
          <Stack.Screen name="DriverTrip" component={Screens.DriverTrip} options={locked} />
          <Stack.Screen name="RideComplete" component={Screens.RideComplete} options={locked} />
          <Stack.Screen name="Chat" component={Screens.Chat} />
          <Stack.Screen name="CancelRide" component={Screens.CancelRide} />
          <Stack.Screen name="Vehicles" component={Screens.Vehicles} />
          <Stack.Screen name="AddVehicle" component={Screens.AddVehicle} />
          <Stack.Screen name="Settings" component={Screens.Settings} />
          <Stack.Screen name="History" component={Screens.History} />
          <Stack.Screen name="Wallet" component={Screens.Wallet} />
          <Stack.Screen name="Menu" component={Screens.Menu} options={{ animation: 'slide_from_left' }} />
        </Stack.Navigator>
      </NavigationContainer>
    </>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <SearchProvider>
          <GarageProvider>
            <TripProvider>
              <ChatProvider>
                <Shell />
              </ChatProvider>
            </TripProvider>
          </GarageProvider>
        </SearchProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
