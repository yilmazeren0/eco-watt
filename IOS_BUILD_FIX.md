# iOS Build Sorunu Çözümü

## Problem
`react-native-reanimated` kütüphanesi React Native 0.81 ile uyumsuzluk gösteriyor.
Hata: `'folly/coro/Coroutine.h' file not found`

## Çözüm Adımları

### 1. Metro Server'ı Durdur
Terminal'de `Ctrl+C` ile Metro server'ı durdur.

### 2. React Native Reanimated'ı Kaldır

```bash
# package.json'dan manuel olarak kaldır
# Bu satırı sil: "react-native-reanimated": "^3.3.0",

# index.js'den import'u kaldır  
# Bu satırı sil: import 'react-native-gesture-handler';

# Node modules temizle
rm -rf node_modules package-lock.json
npm install
```

### 3. iOS Dependencies Temizle

```bash
cd ios
rm -rf Pods Podfile.lock
pod install
cd ..
```

### 4. Projeyi Çalıştır

```bash
npm start
npm run ios
```

## Alternatif Çözümler

### Eski Versiyon Kullan
```bash
npm install react-native-reanimated@2.17.0
```

### React Native Güncelle
```bash
npx react-native upgrade
```

## Şu Anki Durum
- Metro development server çalışıyor
- TypeScript derleme başarılı
- Uygulama kodları hazır
- Sadece iOS native build sorunu var
