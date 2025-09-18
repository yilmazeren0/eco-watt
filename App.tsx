import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { StatusBar } from 'react-native';
import { AuthProvider, useAuth } from './src/contexts/AuthContext';
import { RootStackParamList } from './src/types/navigation';
import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import DashboardScreen from './src/screens/DashboardScreen';
import CreateDemandScreen from './src/screens/CreateDemandScreen';
import AllCompaniesScreen from './src/screens/AllCompaniesScreen';

const Stack = createStackNavigator<RootStackParamList>();

const AppNavigator: React.FC = () => {
  const { user, loading } = useAuth();

  if (loading) {
    // Burada loading screen ekleyebiliriz
    return null;
  }

  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: '#4CAF50',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}>
      {user ? (
        // Authenticated screens
        <>
          <Stack.Screen 
            name="Dashboard" 
            component={DashboardScreen}
            options={{ title: 'Dashboard' }}
          />
          <Stack.Screen 
            name="CreateDemand" 
            component={CreateDemandScreen}
            options={{ title: 'Talep Oluştur' }}
          />
          <Stack.Screen 
            name="AllCompanies" 
            component={AllCompaniesScreen}
            options={{ title: 'Tüm Şirketler' }}
          />
        </>
      ) : (
        // Auth screens
        <>
          <Stack.Screen 
            name="Login" 
            component={LoginScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen 
            name="Register" 
            component={RegisterScreen}
            options={{ headerShown: false }}
          />
        </>
      )}
    </Stack.Navigator>
  );
};

function App(): React.JSX.Element {
  return (
    <AuthProvider>
      <NavigationContainer>
        <StatusBar barStyle="light-content" backgroundColor="#4CAF50" />
        <AppNavigator />
      </NavigationContainer>
    </AuthProvider>
  );
}

export default App;
