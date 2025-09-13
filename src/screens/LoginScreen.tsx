import React, {useState} from 'react';
import { Colors } from '../constants/Colors';
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
    backgroundColor: Colors.background,
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
    color: Colors.primary,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    color: Colors.secondary,
  },
  formContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 24,
    shadowColor: Colors.black,
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
    color: Colors.textDark,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: Colors.inputBackground,
  },
  loginButton: {
    backgroundColor: Colors.primary,
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
    backgroundColor: Colors.demoBackground,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: Colors.primary,
  },
  demoText: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '500',
  },
});

export default LoginScreen;
