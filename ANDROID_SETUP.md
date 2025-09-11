# Android SDK Kurulum Rehberi

## Sorun
Android build başarısız oluyor çünkü ANDROID_HOME environment variable tanımlanmamış.

```
SDK location not found. Define a valid SDK location with an ANDROID_HOME environment variable
```

## Çözüm

### 1. Android Studio'da SDK yolunu bul
1. **Android Studio'yu aç**
2. **Settings** → **Appearance & Behavior** → **System Settings** → **Android SDK**
3. **SDK Location** yolunu kopyala (genellikle: `/Users/ereny/Library/Android/sdk`)

### 2. Environment variables ekle

#### Seçenek A: Geçici (sadece bu terminal)
```bash
export ANDROID_HOME=/Users/ereny/Library/Android/sdk
export PATH=$PATH:$ANDROID_HOME/emulator
export PATH=$PATH:$ANDROID_HOME/platform-tools
```

#### Seçenek B: Kalıcı (zsh profil)
```bash
echo 'export ANDROID_HOME=/Users/ereny/Library/Android/sdk' >> ~/.zshrc
echo 'export PATH=$PATH:$ANDROID_HOME/emulator' >> ~/.zshrc
echo 'export PATH=$PATH:$ANDROID_HOME/platform-tools' >> ~/.zshrc
source ~/.zshrc
```

### 3. Android Emulator aç
1. **Android Studio** → **Device Manager**
2. Bir emulator seç ve başlat
3. Emulator açıldıktan sonra: `npm run android`

### 4. Alternatif: iOS kullan
Android kurulumu karmaşıksa, projeyi iOS'ta test edin:
```bash
npm run ios  # iOS simulator'da çalışıyor
```

## Hızlı Test
```bash
# iOS'ta test et (Metro server zaten çalışıyor)
npm run ios

# Demo bilgileri:
# Şirket Kodu: COMP001
# Şifre: 123456
```
