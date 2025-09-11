import React, {useState} from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {StatusBar} from 'react-native';
import LoginScreen from './src/screens/LoginScreen';
import DashboardScreen from './src/screens/DashboardScreen';
import CreateDemandScreen from './src/screens/CreateDemandScreen';
import AllCompaniesScreen from './src/screens/AllCompaniesScreen';

function App(): React.JSX.Element {
  const [currentScreen, setCurrentScreen] = useState<'Login' | 'Dashboard' | 'CreateDemand' | 'AllCompanies'>('Login');
  const [companyData, setCompanyData] = useState<{companyName: string; companyCode: string} | null>(null);

  const navigateToScreen = (screen: string, params?: any) => {
    if (screen === 'Login') {
      setCurrentScreen('Login');
      setCompanyData(null);
    } else if (screen === 'Dashboard') {
      setCompanyData(params);
      setCurrentScreen('Dashboard');
    } else if (screen === 'CreateDemand') {
      setCurrentScreen('CreateDemand');
    } else if (screen === 'AllCompanies') {
      setCurrentScreen('AllCompanies');
    }
  };

  const mockNavigation = {
    navigate: navigateToScreen,
    goBack: () => setCurrentScreen('Dashboard'),
  };

  const mockRoute = {
    params: companyData || {companyName: '', companyCode: ''},
  };

  const renderScreen = () => {
    switch (currentScreen) {
      case 'Login':
        return <LoginScreen navigation={mockNavigation as any} />;
      case 'Dashboard':
        return <DashboardScreen navigation={mockNavigation as any} route={mockRoute as any} />;
      case 'CreateDemand':
        return <CreateDemandScreen navigation={mockNavigation as any} route={mockRoute as any} />;
      case 'AllCompanies':
        return <AllCompaniesScreen navigation={mockNavigation as any} />;
      default:
        return <LoginScreen navigation={mockNavigation as any} />;
    }
  };

  return (
    <NavigationContainer>
      <StatusBar barStyle="dark-content" backgroundColor="#f5f5f5" />
      {renderScreen()}
    </NavigationContainer>
  );
}

export default App;
