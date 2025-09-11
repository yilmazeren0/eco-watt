import React, {useState} from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {StatusBar} from 'react-native';
import LoginScreen from './src/screens/LoginScreen';
import DashboardScreen from './src/screens/DashboardScreen';

function App(): React.JSX.Element {
  const [currentScreen, setCurrentScreen] = useState<'Login' | 'Dashboard'>('Login');
  const [companyData, setCompanyData] = useState<{companyName: string; companyCode: string} | null>(null);

  const navigateToLogin = () => {
    setCurrentScreen('Login');
    setCompanyData(null);
  };

  const navigateToDashboard = (data: {companyName: string; companyCode: string}) => {
    setCompanyData(data);
    setCurrentScreen('Dashboard');
  };

  const mockNavigation = {
    navigate: (screen: string, params?: any) => {
      if (screen === 'Login') {
        navigateToLogin();
      } else if (screen === 'Dashboard') {
        navigateToDashboard(params);
      }
    },
  };

  const mockRoute = {
    params: companyData || {companyName: '', companyCode: ''},
  };

  return (
    <NavigationContainer>
      <StatusBar barStyle="dark-content" backgroundColor="#f5f5f5" />
      {currentScreen === 'Login' ? (
        <LoginScreen navigation={mockNavigation as any} />
      ) : (
        <DashboardScreen navigation={mockNavigation as any} route={mockRoute as any} />
      )}
    </NavigationContainer>
  );
}

export default App;
