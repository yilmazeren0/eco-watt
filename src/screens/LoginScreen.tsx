import React, {useState} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';

interface Props {
  navigation: {
    navigate: (screen: string, params?: any) => void;
  };
}

const LoginScreen: React.FC<Props> = ({navigation}) => {
  const [companyName, setCompanyName] = useState('');
  const [companyCode, setCompanyCode] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = () => {
    if (!companyName.trim() || !companyCode.trim() || !password.trim()) {
      Alert.alert('Hata', 'Lütfen tüm alanları doldurun.');
      return;
    }

    // Basit doğrulama - gerçek uygulamada API çağrısı yapılacak
    if (companyCode === 'COMP001' && password === '123456') {
      navigation.navigate('Dashboard', {
        companyName,
        companyCode,
      });
    } else {
      Alert.alert('Hata', 'Geçersiz şirket kodu veya şifre.');
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.headerContainer}>
          <Text style={styles.title}>Yeşil Dönüşüm</Text>
          <Text style={styles.subtitle}>Şirket Girişi</Text>
        </View>

        <View style={styles.formContainer}>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Şirket Adı</Text>
            <TextInput
              style={styles.input}
              placeholder="Şirket adınızı girin"
              value={companyName}
              onChangeText={setCompanyName}
              autoCapitalize="words"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Şirket Kodu</Text>
            <TextInput
              style={styles.input}
              placeholder="Şirket kodunuzu girin"
              value={companyCode}
              onChangeText={setCompanyCode}
              autoCapitalize="characters"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Şifre</Text>
            <TextInput
              style={styles.input}
              placeholder="Şifrenizi girin"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </View>

          <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
            <Text style={styles.loginButtonText}>Giriş Yap</Text>
          </TouchableOpacity>

          <View style={styles.demoInfo}>
            <Text style={styles.demoText}>Demo Bilgileri:</Text>
            <Text style={styles.demoText}>Şirket Kodu: COMP001</Text>
            <Text style={styles.demoText}>Şifre: 123456</Text>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#2E8B57',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    color: '#666',
  },
  formContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
  },
  loginButton: {
    backgroundColor: '#2E8B57',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 20,
  },
  loginButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  demoInfo: {
    marginTop: 20,
    padding: 16,
    backgroundColor: '#e8f5e8',
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#2E8B57',
  },
  demoText: {
    fontSize: 14,
    color: '#2E8B57',
    fontWeight: '500',
  },
});

export default LoginScreen;
