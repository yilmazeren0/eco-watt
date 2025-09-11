<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

# Yeşil Dönüşüm React Native Projesi

Bu proje, şirketlerin elektrik tüketim verilerini görüntüleyebileceği React Native mobil uygulamasıdır.

## ✅ Proje Durumu: TAMAMLANDI

### Özellikler:
- ✅ Şirket giriş ekranı (LoginScreen.tsx)  
- ✅ Dashboard ekranı (DashboardScreen.tsx)
- ✅ Elektrik talep ve fiyat tabloları
- ✅ TypeScript tip güvenliği
- ✅ Simplified navigation sistem
- ✅ iOS build sorunu çözüldü

### Demo Bilgileri:
- Şirket Kodu: COMP001
- Şifre: 123456

### Teknik Notlar:
1. react-native-reanimated kaldırıldı (React Native 0.81 uyumsuzluğu)
2. Simplified navigation kullanılıyor (stack navigation yerine)
3. Metro server persistence sorunu: manuel durdurma gerekli

### Çalıştırma:
```bash
# iOS build sorunu varsa önce temizlik:
./clean-and-install.sh

# Sonra normal çalıştırma:
npm start
npm run ios
```

### Son Durum:
Proje tamamen fonksiyonel. iOS build sorunları çözüldü. Kullanıma hazır!
